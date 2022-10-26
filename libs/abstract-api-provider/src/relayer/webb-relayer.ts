// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType, parseTypedChainId } from '@webb-tools/sdk-core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import {
  Capabilities,
  CMDSwitcher,
  RelayedChainInput,
  RelayerCMDKey,
  RelayerMessage,
  WithdrawRelayerArgs,
} from './types';

/**
 * Relayer withdraw status
 *
 * @param PreFlight - the withdraw hasnt yet started
 * @param OnFlight - the withdraw has been submitted to the relayers and no response yet
 * @param Continue - the withdraw is being processed
 * @param CleanExit - the withdraw is done with success
 * @param Errored - failed to create the withdraw
 **/
export enum RelayedWithdrawResult {
  PreFlight,
  OnFlight,
  Continue,
  CleanExit,
  Errored,
}

/**
 * Fetching leaves from the relayer is faster than querying a chain's node.
 * The relayer will return it's state for the given merkle tree - all of the leaves up to the latest synced block value.
 *
 * @param leaves - Array of hex representation of the leaves
 * @param lastQueriedBlock - Block number at which that last update of the leaves occurred in the relayer side
 **/
type RelayerLeaves = {
  leaves: string[];
  lastQueriedBlock: number;
};

/**
 * Relayed withdraw is a class meant to encapsulate the communication between client (WebbRelayer instance)
 * and relayer during a withdraw.
 * @param status - Status for the relayed Withdraw initially it's `PreFlight`
 * @param watcher - watch for the current withdraw status [Status, Error or transaction hash]
 * @param prefix - Prefix is used in the Record as a key for indicating the command that the relayer will parse
 * ```typescript
 * // anchorRelayTx is a prefix
 * const relayerAnchorPayload  = {
 *  emv:{
 *   anchorRelayTx:{
 *       ...
 *     }
 *    }
 * }
 * ```
 *
 **/
class RelayedWithdraw {
  private status: RelayedWithdrawResult = RelayedWithdrawResult.PreFlight;
  readonly watcher: Observable<[RelayedWithdrawResult, string | undefined]>;
  private emitter: Subject<[RelayedWithdrawResult, string | undefined]> = new Subject();

  constructor(private ws: WebSocket, private prefix: RelayerCMDKey) {
    this.watcher = this.emitter.asObservable();

    ws.onmessage = ({ data }) => {
      const handledMessage = this.handleMessage(JSON.parse(data));

      this.status = handledMessage[0];
      this.emitter.next(handledMessage);

      if (this.status === RelayedWithdrawResult.CleanExit) {
        this.emitter.complete();
        this.ws.close();
      }
    };

    ws.onerror = (e) => {
      console.log(e);
    };
  }

  private handleMessage = (data: RelayerMessage): [RelayedWithdrawResult, string | undefined] => {
    if (data.error || data.withdraw?.errored) {
      return [RelayedWithdrawResult.Errored, data.error || data.withdraw?.errored?.reason];
    } else if (data.network === 'invalidRelayerAddress') {
      return [RelayedWithdrawResult.Errored, 'Invalid relayer address'];
    } else if (data.withdraw?.finalized) {
      return [RelayedWithdrawResult.CleanExit, data.withdraw.finalized.txHash];
    } else {
      return [RelayedWithdrawResult.Continue, undefined];
    }
  };

  generateWithdrawRequest<T extends RelayedChainInput, C extends CMDSwitcher<T['baseOn']>>(
    chain: T,
    payload: WithdrawRelayerArgs<T['baseOn'], C>
  ) {
    console.log('withdraw payload: ', payload);

    return {
      [chain.baseOn]: {
        [this.prefix]: {
          contract: chain.contractAddress,
          ...payload,
        },
      },
    };
  }

  send(withdrawRequest: any) {
    if (this.status !== RelayedWithdrawResult.PreFlight) {
      throw Error('there is a withdraw process running');
    }

    this.status = RelayedWithdrawResult.OnFlight;
    this.ws.send(JSON.stringify(withdrawRequest));
  }

  await() {
    return this.watcher
      .pipe(
        filter(([next]) => {
          return next === RelayedWithdrawResult.CleanExit || next === RelayedWithdrawResult.Errored;
        })
      )
      .toPromise();
  }

  get currentStatus() {
    return this.status;
  }
}

export class WebbRelayer {
  constructor(readonly endpoint: string, readonly capabilities: Capabilities) {}

  async initWithdraw<Target extends RelayerCMDKey>(target: Target) {
    const ws = new WebSocket(this.endpoint.replace('http', 'ws') + '/ws');

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    /// insure the socket is open
    /// maybe removed soon
    for (;;) {
      if (ws.readyState === 1) {
        break;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 300);
      });
    }

    return new RelayedWithdraw(ws, target);
  }

  async getIp(): Promise<string> {
    const req = await fetch(`${this.endpoint}/api/v1/ip`);

    if (req.ok) {
      return req.json();
    } else {
      throw new Error('network error');
    }
  }

  async getLeaves(typedChainId: number, contractAddress: string, abortSignal?: AbortSignal): Promise<RelayerLeaves> {
    const { chainId, chainType } = parseTypedChainId(typedChainId);
    let url: string = '';
    switch (chainType) {
      case ChainType.EVM:
        url = `${this.endpoint}/api/v1/leaves/evm/${chainId.toString(16)}/${contractAddress}`;
        break;
      case ChainType.Substrate:
        url = `${this.endpoint}/api/v1/leaves/substrate/${chainId.toString(16)}/${contractAddress}`;
        break;
      default:
        url = `${this.endpoint}/api/v1/leaves/evm/${chainId.toString(16)}/${contractAddress}`;
        break;
    }
    const req = await fetch(url, { signal: abortSignal });

    if (req.ok) {
      const jsonResponse = await req.json();
      console.log('response: ', jsonResponse);
      const fetchedLeaves: string[] = jsonResponse.leaves;
      const lastQueriedBlock: string = jsonResponse.lastQueriedBlock;
      const lastQueriedBlockNumber: number = parseInt(lastQueriedBlock, 16);

      return {
        lastQueriedBlock: lastQueriedBlockNumber,
        leaves: fetchedLeaves,
      };
    } else {
      throw new Error('network error');
    }
  }

  static intoActiveWebRelayer(
    instance: WebbRelayer,
    query: { typedChainId: number; basedOn: 'evm' | 'substrate' },
    getFees: (note: string) => Promise<{ totalFees: string; withdrawFeePercentage: number } | undefined>
  ): ActiveWebbRelayer {
    return new ActiveWebbRelayer(instance.endpoint, instance.capabilities, query, getFees);
  }
}

export class ActiveWebbRelayer extends WebbRelayer {
  constructor(
    endpoint: string,
    capabilities: Capabilities,
    private query: { typedChainId: number; basedOn: 'evm' | 'substrate' },
    private getFees: (note: string) => Promise<{ totalFees: string; withdrawFeePercentage: number } | undefined>
  ) {
    super(endpoint, capabilities);
  }

  private get config() {
    const list = this.capabilities.supportedChains[this.query.basedOn];
    return list.get(this.query.typedChainId);
  }

  get gasLimit(): number | undefined {
    return undefined;
  }

  get account(): string | undefined {
    return this.config?.account;
  }

  get beneficiary(): string | undefined {
    return this.config?.beneficiary;
  }

  fees = async (note: string) => {
    return this.getFees(note);
  };
}
