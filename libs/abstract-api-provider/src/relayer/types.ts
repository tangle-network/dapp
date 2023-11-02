// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { HexString } from '@polkadot/util/types';
import { RelayerCMDBase } from '@webb-tools/dapp-config/relayer-config';
import { IVariableAnchorExtData } from '@webb-tools/interfaces';
import { Hash, Hex } from 'viem';
import { ActiveWebbRelayer, WebbRelayer } from '.';

/**
 * Relayer configuration for a chain
 * @param account - Relayer account that is going to be used to sign the transaction
 * @param beneficiary - Account that will receive the reward for relaying a transaction
 * @param enabled - Indicates if the relayer is enabled
 * @param contracts -  List of contracts supported by a relayer
 **/
export type RelayedChainConfig<BaseOn extends RelayerCMDBase> = {
  account: string;
  beneficiary?: string;
  enabled?: boolean;
  contracts: BaseOn extends 'evm' ? Contract[] : never;
  pallets: BaseOn extends 'substrate' ? Pallet[] : never;
  relayerFeeConfig: BaseOn extends 'evm'
    ?
        | {
            relayerProfitPercent: number;
            maxRefundAmount: number;
          }
        | undefined
    : never;
};

/**
 * Relayer capabilities, it's fetched from the relayer over http
 *  @param hasIpService - indicates if the relayer has support for IP address
 *  @param supportChains - A map for supported chains for both evm and substrate
 **/
export type Capabilities = {
  hasIpService: boolean;
  features: RelayerFeatures;
  supportedChains: {
    substrate: Map<number, RelayedChainConfig<'substrate'>>;
    evm: Map<number, RelayedChainConfig<'evm'>>;
  };
};

/**
 * Relayer contract info, it indicates what support the relayer is doing for a given contract
 * @param contract - The type of contract/system that the relayer supports (Anchor, SignatureBridge)
 * @param address - Contract address
 * @param deployedAt - The block number the contract was deployed at
 * @param eventsWatcher - The status  of the event watcher for the contract
 * @param size - The anchor's size
 * @param withdrawFeePercentage - Relayer fee percentage used to estimate transaction costs
 * @param linkedAnchor - Linked anchors that a relayer is supporting
 **/
export type ContractName = 'VAnchor';

export interface Contract {
  contract: ContractName;
  address: string;
  deployedAt: number;
  eventsWatcher: EventsWatcher;
  size: number;
  withdrawFeePercentage: number;
  linkedAnchors: LinkedAnchor[];
}

export interface Pallet {
  pallet: string;
  eventsWatcher: Partial<{
    enableDataQuery: boolean;
    enabled: boolean;
    pollingInterval: number;
    maxBlocksPerStep: number;
    printProgressInterval: number;
    syncBlocksFrom: number;
  }>;
}

export interface LinkedAnchor {
  chain: string;
  address: string;
}

/**
 * Contract events watcher configuration
 * @param enabled - If the event watcher is enabled at all
 * @param pollingInterval - The interval the Relayer is reaching out to node/contracts for new events
 **/
export interface EventsWatcher {
  enabled: boolean;
  pollingInterval: number;
}

// An object which contains the fields necessary for generating
// A withdraw request
export type RelayedChainInput = {
  endpoint: string;
  name: string;
  baseOn: RelayerCMDBase;
  contractAddress: string;
};

// An object to represent a token / amount pair which will be used
// for querying relayer support.
export type FixedSizeQuery = {
  amount: number;
  tokenSymbol: string;
};

/**
 * Relayer query object all the values are optional
 *
 * @param baseOn - Whether relayer supports evm or substrate.
 * @param ipService - Whether relayer supports the IP service
 * @param chainId - Relayer supportedChains has a chainId
 * @param contractAddress - Relayer supports the contract address
 * @param contract - Relayer has support for a
 **/
export type RelayerQuery = {
  baseOn?: RelayerCMDBase;
  ipService?: true;
  chainId?: number;
  contractAddress?: string;
  contract?: ContractName;
  typedChainId?: number;
};

export type ChainNameIntoChainId = (
  name: string,
  basedOn: RelayerCMDBase
) => number | null;

export interface RelayerFeatures {
  dataQuery?: boolean;
  governanceRelay?: boolean;
  privateTxRelay?: boolean;
}

/**
 * The relayer info object returned
 * from the query /api/v1/info
 */
export interface RelayerInfo {
  substrate: Record<string, RelayedChainConfig<'substrate'> | null>;
  evm: Record<string, RelayedChainConfig<'evm'> | null>;
  features: RelayerFeatures;
}

/**
 * Relayer withdraw status
 * @param finalized - The Relayed withdraw transaction  is finished ,and it contains the `txHash`
 * @param errored - The Relayed withdraw transaction has failed
 * @param connected - The relayer has connected
 * @param connecting - The relayer is attempting to connect
 **/
export interface Withdraw {
  finalized?: Finalized;
  errored?: Errored;
  connected?: string;
  connecting?: string;
}

/**
 * Relayer withdraw finalization payload
 * @param txHash - Withdraw transaction hash
 **/
export interface Finalized {
  txHash: string;
}

/**
 * Relayer withdraw error payload
 * @param reason - Reason for transaction failure
 **/
export interface Errored {
  reason: string;
}

/**
 * General relayer WebSocket message, for each event it can be on of `withdraw`, `error`, or `network`
 * @param withdraw - Withdraw event of the message
 * @param error - General relayer error message
 * @param network - Relayer network status update
 **/
export type RelayerMessage = {
  itemKey: Hex;
  status:
    | 'Pending'
    | { Processing: { step: string; progress: number } }
    | { Failed: { reason: string } }
    | {
        Processed: {
          txHash: Hash;
        };
      };
};

/**
 * Proof data object for VAnchor proofs on substrate chain
 * @param proof - Encoded proof data
 * @param publicAmount - Public amount for proof
 * @param roots - Merkle roots for the proof
 * @param inputNullifiers - nullifer hashes for the proof
 * @param outputCommitments - Output commitments for the proof
 * @param extDataHash - External data hash for the proof external data
 * */
type SubstrateProofData = {
  proof: HexString;
  publicAmount: HexString;
  roots: Array<HexString>;
  inputNullifiers: Array<HexString>;
  outputCommitments: Array<HexString>;
  extDataHash: HexString;
  extensionRoots: Array<HexString>;
};

/**
 * External data for the VAnchor on any chain
 *
 * @param recipient -  Recipient identifier of the withdrawn funds
 * @param relayer - Relayer identifier of the transaction
 * @param extAmount - External amount being deposited or withdrawn withdrawn
 * @param fee - Fee to pay the relayer
 * @param encryptedOutput1 - First encrypted output commitment
 * @param encryptedOutput2 - Second encrypted output commitment
 * */
type SubstrateExtData = {
  recipient: string;
  relayer: string;
  extAmount: string;
  fee: string;
  encryptedOutput1: string;
  encryptedOutput2: string;
  refund: string;
  token: number;
};

/**
 * Contains data that is relayed to the VAnchors
 * @param chain_id - The chain_id of a supported chain of this relayer
 * @param id - The tree id of the vanchor's underlying tree
 * @param proofData - The zero-knowledge proof data structure for VAnchor transactions
 * @param extData - The external data structure for arbitrary inputs
 * */
type VAnchorSubstrateRelayTransaction = {
  chainId: number;
  id: number | string;
  proofData: SubstrateProofData;
  extData: SubstrateExtData;
};

/**
 * Proof data object for VAnchor proofs on evm chain
 * @param proof - Encoded proof data
 * @param publicAmount - Public amount for proof
 * @param roots - Merkle roots for the proof
 * @param extensionRoots - The extra roots for extension VAnchors such as IdentityVAnchor
 * @param inputNullifiers - nullifer hashes for the proof
 * @param outputCommitments - Output commitments for the proof
 * @param extDataHash - External data hash for the proof external data
 **/
type EVMProofData = {
  proof: string;
  publicAmount: string;
  roots: string;
  extensionRoots: string;
  inputNullifiers: string[];
  outputCommitments: string[];
  extDataHash: string;
};

/**
 * Contains data that is relayed to the VAnchors
 * @param chain_id - The chain_id of a supported chain of this relayer
 * @param id - The tree id of the vanchor's underlying tree
 * @param proofData - The zero-knowledge proof data structure for VAnchor transactions
 * @param extData - The external data structure for arbitrary inputs
 * */
type VAnchorEVMRelayTransaction = {
  chainId: number;
  id: number | string;
  proofData: EVMProofData;
  extData: IVariableAnchorExtData;
};

/**
 * Relayed transaction for substrate
 **/
export type RelayerSubstrateCommands = {
  vAnchor: VAnchorSubstrateRelayTransaction;
};

/**
 * Relayed transaction for EVM
 **/
export type RelayerEVMCommands = {
  vAnchor: VAnchorEVMRelayTransaction;
};

export type EVMCMDKeys = keyof RelayerEVMCommands;
export type SubstrateCMDKeys = keyof RelayerSubstrateCommands;
export type RelayerCMDKey = EVMCMDKeys | SubstrateCMDKeys;

// A state object to track the active relayer of a set of relayers
export type RelayersState = {
  relayers: WebbRelayer[];
  loading: boolean;
  activeRelayer: null | ActiveWebbRelayer;
};

export const shuffleRelayers = (arr: WebbRelayer[]): WebbRelayer[] => {
  let currentIndex = arr.length;
  let randomIndex = 0;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }

  return arr;
};

export type CMDSwitcher<T extends RelayerCMDBase> = T extends 'evm'
  ? EVMCMDKeys
  : SubstrateCMDKeys;

export type RelayerCMDs<
  A extends RelayerCMDBase,
  C extends CMDSwitcher<A>
> = A extends 'evm'
  ? C extends keyof RelayerEVMCommands
    ? RelayerEVMCommands[C]
    : never
  : C extends keyof RelayerSubstrateCommands
  ? RelayerSubstrateCommands[C]
  : never;

export type WithdrawRelayerArgs<
  A extends RelayerCMDBase,
  C extends CMDSwitcher<A>
> = Omit<RelayerCMDs<A, C>, keyof RelayedChainInput>;

export type OptionalRelayer = WebbRelayer | null;
export type OptionalActiveRelayer = ActiveWebbRelayer | null;

export interface SendTxResponse<
  Status extends 'Sent' | 'Failed' = 'Sent' | 'Failed'
> {
  status: Status;
  message: string;
  reason: Status extends 'Failed' ? string : never;
  itemKey: Status extends 'Sent' ? Hex : never;
}
