// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { LoggerService } from '@webb-tools/browser-utils';
import type { RelayerCMDBase } from '@webb-tools/dapp-config/relayer-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  ChainType,
  parseTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { BehaviorSubject, Observable, Subject, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import type {
  CMDSwitcher,
  Capabilities,
  RelayedChainConfig,
  RelayedChainInput,
  RelayerCMDKey,
  RelayerMessage,
  SendTxResponse,
  WithdrawRelayerArgs,
} from './types';
import { AddressType } from '@webb-tools/dapp-config/types';

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
  response: Response,
): Promise<string> => {
  try {
    const text = await response.text();
    if (text) {
      return `Relayer fee error: \`${text}\``;
    }
  } catch {
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

  private emitter: Subject<[RelayedWithdrawResult, string | undefined]> =
    new Subject();

  private readonly logger = LoggerService.get('RelayedWithdraw');

  private readonly txProcesser = new BehaviorSubject<
    | {
        payload: ReturnType<RelayedWithdraw['generateWithdrawRequest']>;
        chainId: number;
      }
    | undefined
  >(undefined);

  readonly SEND_TX_ROUTE = '/api/v1/send';

  readonly QUERY_STATUS_ROUTE = '/api/v1/tx';

  readonly POOLING_INTERVAL = 500;

  readonly watcher: Observable<[RelayedWithdrawResult, string | undefined]>;

  constructor(
    private endpoint: URL,
    private prefix: RelayerCMDKey,
  ) {
    this.watcher = this.emitter.asObservable();

    this.txProcesser.subscribe(async (next) => {
      if (!next) {
        return;
      }

      const { payload, chainId } = next;

      const baseOn = Object.keys(payload)[0];
      if (baseOn !== 'evm' && baseOn !== 'substrate') {
        this.status = RelayedWithdrawResult.Errored;
        this.emitter.next([
          RelayedWithdrawResult.Errored,
          WebbError.getErrorMessage(WebbErrorCodes.InvalidArguments).message,
        ]);
        return;
      }

      const tx = Object.values(payload)[0];
      const anchorIdentifier = tx.vAnchor['contract'];

      const extData = tx.vAnchor['extData'];
      const proofData = tx.vAnchor['proofData'];

      const uri = this.getSendTxUri(baseOn, chainId, anchorIdentifier);
      const body = JSON.stringify({ extData, proofData });

      try {
        this.logger.info(
          `Sending tx to relayer: ${uri} with body: ${JSON.stringify(
            JSON.parse(body),
            null,
            2,
          )}`,
        );
        const resp = await fetch(uri, {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data: SendTxResponse = await resp.json();
        this.logger.info(
          `Got tx response from relayer: ${JSON.stringify(data, null, 2)}`,
        );
        if (data.status === 'Sent') {
          const { itemKey } = data as SendTxResponse<'Sent'>;

          // Start pooling for the status of the tx until it's processed
          // or exit if got 404 error
          const queryStatus = async () => {
            let timeout: ReturnType<typeof setTimeout> | undefined;

            try {
              const resp = await fetch(
                this.getQueryStatusUri(baseOn, chainId, itemKey),
              );

              const data: RelayerMessage = await resp.json();
              const handledMessage = this.handleMessage(data);

              this.status = handledMessage[0];
              this.emitter.next(handledMessage);

              if (this.status === RelayedWithdrawResult.Continue) {
                timeout = setTimeout(queryStatus, this.POOLING_INTERVAL);
              } else if (this.status === RelayedWithdrawResult.CleanExit) {
                clearTimeout(timeout);
                this.emitter.complete();
              }
            } catch (error) {
              let message = WebbError.getErrorMessage(
                WebbErrorCodes.FailedToSendTx,
              ).message;
              if (error instanceof Error) {
                message = error.message;
              }

              // If the tx is not found then it's processed
              this.status = RelayedWithdrawResult.Errored;
              this.emitter.next([RelayedWithdrawResult.Errored, message]);
              clearTimeout(timeout);
              this.emitter.complete();
            }
          };

          queryStatus();
        } else {
          const { reason, message } = data as SendTxResponse<'Failed'>;
          this.status = RelayedWithdrawResult.Errored;
          this.emitter.next([RelayedWithdrawResult.Errored, reason || message]);
        }
      } catch (error) {
        this.logger.error('Relayer error: ', error);

        this.status = RelayedWithdrawResult.Errored;
        this.emitter.next([
          RelayedWithdrawResult.Errored,
          WebbError.getErrorMessage(WebbErrorCodes.FailedToSendTx).message,
        ]);
      }
    });
  }

  private getSendTxUri(
    base: RelayerCMDBase,
    chainId: number,
    anchorIdentifier: string,
  ) {
    return new URL(
      `${this.SEND_TX_ROUTE}/${base}/${chainId}/${anchorIdentifier}`,
      this.endpoint,
    );
  }

  private getQueryStatusUri(
    base: RelayerCMDBase,
    chainId: number,
    itemKey: string,
  ) {
    return new URL(
      `${this.QUERY_STATUS_ROUTE}/${base}/${chainId}/${itemKey}`,
      this.endpoint,
    );
  }

  private handleMessage = (
    data: RelayerMessage,
  ): [RelayedWithdrawResult, string | undefined] => {
    this.logger.info('Relayer message: ', data);

    const { status } = data;

    if (typeof status === 'object' && 'Processed' in status) {
      return [RelayedWithdrawResult.CleanExit, status.Processed.txHash];
    } else if (typeof status === 'object' && 'Failed' in status) {
      return [RelayedWithdrawResult.Errored, status.Failed.reason];
    } else {
      return [RelayedWithdrawResult.Continue, undefined];
    }
  };

  generateWithdrawRequest<
    T extends RelayedChainInput,
    C extends CMDSwitcher<T['baseOn']>,
  >(chain: T, payload: WithdrawRelayerArgs<T['baseOn'], C>) {
    return {
      [chain.baseOn]: {
        [this.prefix]: {
          contract: chain.contractAddress,
          ...payload,
        },
      },
    };
  }

  send(
    withdrawRequest: ReturnType<RelayedWithdraw['generateWithdrawRequest']>,
    chainId: number,
  ) {
    if (this.status !== RelayedWithdrawResult.PreFlight) {
      throw Error('there is a withdraw process running');
    }

    this.status = RelayedWithdrawResult.OnFlight;

    this.txProcesser.next({ payload: withdrawRequest, chainId });
  }

  await(): Promise<[RelayedWithdrawResult, string | undefined]> {
    return firstValueFrom(
      this.watcher.pipe(
        filter(([next, message]) => {
          if (next === RelayedWithdrawResult.Errored) {
            throw new Error(message);
          }

          return next === RelayedWithdrawResult.CleanExit;
        }),
      ),
    );
  }

  get currentStatus() {
    return this.status;
  }
}

export class WebbRelayer {
  constructor(
    readonly endpoint: string,
    readonly capabilities: Capabilities,
  ) {}

  readonly infoRoute = '/api/v1/info';

  get infoUri() {
    // Use URL class to ensure the full url is valid (e.g. with trailing slash)
    return new URL(this.infoRoute, this.endpoint).toString();
  }

  private isEVMSupported(
    relayerChainCfg: RelayedChainConfig<'evm'>,
    anchorId: string,
  ): boolean {
    const supportAnchor = relayerChainCfg.contracts.find(
      (contract) => BigInt(contract.address) === BigInt(anchorId), // Use BigInt to prevent case-sensitive comparison
    );

    return Boolean(supportAnchor);
  }

  private isSubstrateSupported(
    relayerChainCfg: RelayedChainConfig<'substrate'>,
    anchorId: string,
  ): boolean {
    const supportAnchor = relayerChainCfg.pallets.find(
      (pallet) => BigInt(pallet.pallet) === BigInt(anchorId), // Use BigInt to prevent case-sensitive comparison
    );

    return Boolean(supportAnchor);
  }

  isSupported(
    typedChainId: number,
    anchorId: string,
    basedOn: RelayerCMDBase,
  ): boolean {
    if (basedOn === 'evm') {
      const relayerChainCfg =
        this.capabilities.supportedChains.evm.get(typedChainId);
      if (!relayerChainCfg) {
        return false;
      }

      return this.isEVMSupported(relayerChainCfg, anchorId);
    }

    if (basedOn === 'substrate') {
      const relayerChainCfg =
        this.capabilities.supportedChains.substrate.get(typedChainId);
      if (!relayerChainCfg) {
        return false;
      }

      return this.isSubstrateSupported(relayerChainCfg, anchorId);
    }

    console.error(WebbError.getErrorMessage(WebbErrorCodes.InvalidArguments));
    return false;
  }

  async initWithdraw<Target extends RelayerCMDKey>(target: Target) {
    return new RelayedWithdraw(new URL(this.endpoint), target);
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
    abortSignal?: AbortSignal,
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
      const fetchedLeaves: AddressType[] = jsonResponse.leaves;
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
    abortSignal?: AbortSignal,
  ): Promise<RelayerFeeInfo> | never {
    const { chainId, chainType } = parseTypedChainId(typedChainId);

    let endpoint = `${
      this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint
    }/api/v1/fee_info`;

    switch (chainType) {
      case ChainType.EVM:
        endpoint = endpoint.concat(
          `/evm/${chainId.toString()}/${vanchor}/${gasAmount.toString()}`,
        );
        break;
      case ChainType.Substrate:
        endpoint = endpoint.concat(
          `/substrate/${chainId.toString()}/${gasAmount.toString()}`,
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
    query: { typedChainId: number; basedOn: 'evm' | 'substrate' },
  ): ActiveWebbRelayer {
    return new ActiveWebbRelayer(
      instance.endpoint,
      instance.capabilities,
      query,
    );
  }
}

export class ActiveWebbRelayer extends WebbRelayer {
  constructor(
    endpoint: string,
    capabilities: Capabilities,
    private query: { typedChainId: number; basedOn: 'evm' | 'substrate' },
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
