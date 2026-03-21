// Types mirroring @tangle-network/shielded-sdk interfaces.
// When the SDK is added as a dependency, replace with direct imports.

export interface NoteData {
  sourceChainId: number;
  targetChainId: number;
  amount: bigint;
  tokenSymbol: string;
  targetAnchor: string;
  privateKey: string;
  blinding: string;
  index?: number;
}

export interface CreditAccountState {
  spendingKey: string;
  token: string;
  balance: bigint;
  totalFunded: bigint;
  totalSpent: bigint;
  nonce: bigint;
}

export const enum ProofStage {
  IDLE = 'idle',
  FETCHING_ARTIFACTS = 'fetching_artifacts',
  SYNCING_LEAVES = 'syncing_leaves',
  BUILDING_WITNESS = 'building_witness',
  GENERATING_PROOF = 'generating_proof',
  SENDING_TX = 'sending_tx',
  DONE = 'done',
  ERROR = 'error',
}

export interface ProofProgress {
  stage: ProofStage;
  message?: string;
}
