// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ActiveWebbRelayer, WebbRelayer } from '.';
import { RelayerCMDBase } from '@nepoche/dapp-config/relayer-config';

/**
 * Relayer configuration for a chain
 * @param account - Relayer account that is going to be used to sign the transaction
 * @param beneficiary - Account that will receive the reward for relaying a transaction
 * @param contracts -  List of contracts supported by a relayer
 **/
export type RelayedChainConfig = {
  account: string;
  beneficiary?: string;
  contracts: Contract[];
};
/**
 * Relayer capabilities, it's fetched from the relayer over http
 *  @param hasIpService - indicates if the relayer has support for IP address
 *  @param supportChains - A map for supported chains for both evm and substrate
 **/
export type Capabilities = {
  hasIpService: boolean;
  supportedChains: {
    substrate: Map<number, RelayedChainConfig>;
    evm: Map<number, RelayedChainConfig>;
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

export type ChainNameIntoChainId = (name: string, basedOn: RelayerCMDBase) => number | null;

export interface RelayerInfo {
  substrate: Record<string, RelayedChainConfig | null>;
  evm: Record<string, RelayedChainConfig | null>;
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
  withdraw?: Withdraw;
  error?: string;
  network?: string;
};

/**
 * Relayer Mixer transaction payload (Substrate payload)
 * @param chain - chain name
 * @param id - Mixer identifier (Tree id for substrate)
 * @param proof  - An Array of bytes from the proof
 * @param root  - Tree Root from the merkle path
 * @param nullifierHash - Nullifier hash
 * @param recipient - Recipient `AccountId` `SS558` format for substrate
 * @param relayer - Relayer  `AccountId` `SS558` format for substrate
 * @param fee - relayer fee
 * @param refund - .
 *
 * `proof` ,`root` ,and nullifierHash are obtained from `sdk-core` .
 * For `proof` and `root` the type can be ontained from `Uint8Array` in the next example
 * ```typescript
 * const proof:UnitArray = ...;
 * // The way to send the proof to the relayer
 * const proofForRelayerSubmission = Array.from(proof);
 * ```
 **/
export type MixerRelayTx = {
  chain: string;
  // Tree ID (Mixer tree id)
  id: number;
  proof: Array<number>;
  root: Array<number>;
  nullifierHash: Array<number>;
  // Ss558 Format
  recipient: string;
  // Ss558 Format
  relayer: string;
  fee: number;
  refund: number;
};

/**
 * Anchor relayer transaction payload it's similar to mixer/tornado, but don't have the value `root`
 * @param chain - Chain name
 * @param id - The target contract.
 * @param proof - Proof bytes
 * @param fee - Fee value
 * @param refund - Refund value
 * @param relayer - Relayer address
 * @param refreshCommitment - Refresh commitment is used to link the value of the commitment to anchor (to the refreshCommitment),
 * if it passed as zero nothing will happen unless a real value is passed thus a new note isn't generated
 * @param roots - roots bytes array
 **/
type AnchorRelayTransaction = {
  chain: string;
  id: string;
  extDataHash: string;
  proof: string;
  fee: string;
  nullifierHash: string;
  recipient: string;
  refund: string;
  relayer: string;
  refreshCommitment: string;
  roots: string;
};

/**
 * Proof data object for VAnchor proofs on any chain
 *
 * @param proof - Encoded proof data
 * @param publicAmount - Public amount for proof
 * @param roots - Merkle roots for the proof
 * @param inputNullifiers - nullifer hashes for the proof
 * @param outputCommitments - Output commitments for the proof
 * @param extDataHash - External data hash for the proof external data
 * */

type EVMProofData = {
  proof: string;
  publicAmount: string;
  roots: string;
  inputNullifiers: string[];
  outputCommitments: string[];
  extDataHash: string;
};

type SubstrateProofData = {
  proof: Array<number>;
  publicAmount: Array<number>;
  roots: Array<number>[] | number[];
  inputNullifiers: Array<number>[];
  outputCommitments: Array<number>[];
  extDataHash: Array<number>;
};
type ProofData = SubstrateProofData | EVMProofData;

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
  extAmount: number | string;
  fee: number;
  encryptedOutput1: Array<number>;
  encryptedOutput2: Array<number>;
  refund: string;
  token: string;
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
type EVMExtData = {
  recipient: string;
  relayer: string;
  extAmount: string;
  fee: number;
  encryptedOutput1: string;
  encryptedOutput2: string;
  refund: string;
  token: string;
};

type ExtData = EVMExtData | SubstrateExtData;
/**
 * Contains data that is relayed to the VAnchors
 * @param chain_id - The chain_id of a supported chain of this relayer
 * @param id - The tree id of the mixer's underlying tree
 * @param proofData - The zero-knowledge proof data structure for VAnchor transactions
 * @param extData - The external data structure for arbitrary inputs
 * */
type VAnchorRelayTransaction = {
  chainId: number;
  id: number | string;
  proofData: ProofData;
  extData: ExtData;
};

/**
 * Relayed transaction for substrate
 **/
export type RelayerSubstrateCommands = {
  mixer: MixerRelayTx;
  vAnchor: VAnchorRelayTransaction;
};
/**
 * Relayed transaction for EVM
 **/
export type RelayerEVMCommands = {
  anchor: AnchorRelayTransaction;
  vAnchor: VAnchorRelayTransaction;
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

    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
};

export type CMDSwitcher<T extends RelayerCMDBase> = T extends 'evm' ? EVMCMDKeys : SubstrateCMDKeys;

export type RelayerCMDs<A extends RelayerCMDBase, C extends CMDSwitcher<A>> = A extends 'evm'
  ? C extends keyof RelayerEVMCommands
    ? RelayerEVMCommands[C]
    : never
  : C extends keyof RelayerSubstrateCommands
  ? RelayerSubstrateCommands[C]
  : never;

export type WithdrawRelayerArgs<A extends RelayerCMDBase, C extends CMDSwitcher<A>> = Omit<
  RelayerCMDs<A, C>,
  keyof RelayedChainInput
>;

export type OptionalRelayer = WebbRelayer | null;
export type OptionalActiveRelayer = ActiveWebbRelayer | null;
