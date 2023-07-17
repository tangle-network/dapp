// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType, parseTypedChainId } from '@webb-tools/sdk-core';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LoggerService } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  CMDSwitcher,
  Capabilities,
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

export interface RelayerFeeInfo {
  estimatedFee: bigint;
  gasPrice: bigint;
  refundExchangeRate: bigint;
  maxRefund: bigint;
  timestamp: Date;
}

export const parseRelayerFeeInfo = (data: any): RelayerFeeInfo | never => {
  return {
    estimatedFee: BigInt(data.estimatedFee),
    gasPrice: BigInt(data.gasPrice),
    refundExchangeRate: BigInt(data.refundExchangeRate),
    maxRefund: BigInt(data.maxRefund),
    timestamp: new Date(data.timestamp),
  };
};

const parseRelayerFeeErrorMessage = async (
  response: Response
): Promise<string> => {
  try {
    const text = await response.text();
    if (text) {
      return `Relayer fee error: \`${text}\``;
    }
  } catch (e) {
    // ignore error
  }

  const errorText = response.statusText || 'Unknown error';

  return `Relayer fee error: [${response.status}] \`${errorText}\``;
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
  private emitter: Subject<[RelayedWithdrawResult, string | undefined]> =
    new Subject();

  private readonly logger = LoggerService.get('RelayedWithdraw');

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
      this.logger.error('Relayer error: ', e);
    };
  }

  private handleMessage = (
    data: RelayerMessage
  ): [RelayedWithdrawResult, string | undefined] => {
    this.logger.info('Relayer message: ', data);

    if (data.network && typeof data.network !== 'string') {
      const { failed } = data.network;

      return [
        RelayedWithdrawResult.Errored,
        failed?.reason || 'Relayer network error',
      ];
    } else if (data.error || data.withdraw?.errored) {
      return [
        RelayedWithdrawResult.Errored,
        data.error || data.withdraw?.errored?.reason,
      ];
    } else if (data.network === 'invalidRelayerAddress') {
      return [RelayedWithdrawResult.Errored, 'Invalid relayer address'];
    } else if (data.withdraw?.finalized) {
      return [RelayedWithdrawResult.CleanExit, data.withdraw.finalized.txHash];
    } else {
      return [RelayedWithdrawResult.Continue, undefined];
    }
  };

  generateWithdrawRequest<
    T extends RelayedChainInput,
    C extends CMDSwitcher<T['baseOn']>
  >(chain: T, payload: WithdrawRelayerArgs<T['baseOn'], C>) {
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

  await(): Promise<[RelayedWithdrawResult, string | undefined]> {
    return firstValueFrom(
      this.watcher.pipe(
        filter(([next]) => {
          return (
            next === RelayedWithdrawResult.CleanExit ||
            next === RelayedWithdrawResult.Errored
          );
        })
      )
    );
  }

  get currentStatus() {
    return this.status;
  }
}

export class WebbRelayer {
  constructor(readonly endpoint: string, readonly capabilities: Capabilities) {}

  readonly infoRoute = '/api/v1/info';

  get infoUri() {
    // Use URL class to ensure the full url is valid (e.g. with trailing slash)
    return new URL(this.infoRoute, this.endpoint).toString();
  }

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

  async getLeaves(
    typedChainId: number,
    contractAddressOrSubstratePayload:
      | string
      | { treeId: number; palletId: number },
    abortSignal?: AbortSignal
  ): Promise<RelayerLeaves> {
    const { chainId, chainType } = parseTypedChainId(typedChainId);
    const baseUrl = `${this.endpoint}/api/v1/leaves`;
    let path = '';
    switch (chainType) {
      case ChainType.EVM: {
        // EVM only supports contract address
        if (typeof contractAddressOrSubstratePayload !== 'string') {
          throw new Error('EVM only supports contract address');
        }

        const contractAddress = contractAddressOrSubstratePayload;

        // Match endpoint here: https://github.com/webb-tools/relayer#for-evm
        path = `/evm/${chainId.toString()}/${contractAddress}`;
        break;
      }
      case ChainType.Substrate: {
        // Substrate only supports palletId and treeId
        if (typeof contractAddressOrSubstratePayload === 'string') {
          throw new Error('Substrate only supports palletId and treeId');
        }

        const { treeId, palletId } = contractAddressOrSubstratePayload;

        // Match endpoint here: https://github.com/webb-tools/relayer#for-substrate
        path = `/substrate/${chainId}/${treeId}/${palletId}`;
        break;
      }
      default:
        throw new Error('unknown chain type');
    }
    const req = await fetch(`${baseUrl}${path}`, { signal: abortSignal });

    if (req.ok) {
      const jsonResponse = await req.json();
      console.log(
        `Response from ${this.endpoint} for chain ${chainsPopulated[typedChainId]?.name}: `,
        jsonResponse
      );
      const fetchedLeaves: `0x${string}`[] = jsonResponse.leaves;
      const lastQueriedBlock: string = jsonResponse.lastQueriedBlock;
      const lastQueriedBlockNumber: number = parseInt(lastQueriedBlock);

      return {
        lastQueriedBlock: lastQueriedBlockNumber,
        leaves: fetchedLeaves,
      };
    } else {
      throw new Error('network error');
    }
  }

  public async getFeeInfo(
    typedChainId: number,
    vanchor: string,
    gasAmount: bigint,
    abortSignal?: AbortSignal
  ): Promise<RelayerFeeInfo> | never {
    const { chainId, chainType } = parseTypedChainId(typedChainId);

    let endpoint = `${
      this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint
    }/api/v1/fee_info`;

    switch (chainType) {
      case ChainType.EVM:
        endpoint = endpoint.concat(
          `/evm/${chainId.toString()}/${vanchor}/${gasAmount.toString()}`
        );
        break;
      case ChainType.Substrate:
        endpoint = endpoint.concat(
          `/substrate/${chainId.toString()}/${gasAmount.toString()}`
        );
        break;
      default:
        throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }

    const response = await fetch(endpoint, { signal: abortSignal });

    if (!response.ok) {
      const errorMessage = await parseRelayerFeeErrorMessage(response);
      throw new Error(errorMessage);
    }
    return parseRelayerFeeInfo(await response.json());
  }

  static intoActiveWebRelayer(
    instance: WebbRelayer,
    query: { typedChainId: number; basedOn: 'evm' | 'substrate' }
  ): ActiveWebbRelayer {
    return new ActiveWebbRelayer(
      instance.endpoint,
      instance.capabilities,
      query
    );
  }
}

export class ActiveWebbRelayer extends WebbRelayer {
  constructor(
    endpoint: string,
    capabilities: Capabilities,
    private query: { typedChainId: number; basedOn: 'evm' | 'substrate' }
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
}
