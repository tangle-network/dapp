import { ZKPInput, ZKPInputWithoutMerkleProof } from '@webb-dapp/contracts/contracts';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { Deposit } from '@webb-dapp/contracts/utils/make-deposit';

export type ZKPFromDepositInput = {
  relayer?: string;
  recipient: string;
  refund?: number;
  fee?: number;
};

export function fromDepositIntoZKPInput(deposit: Deposit, data: ZKPFromDepositInput): ZKPInputWithoutMerkleProof {
  return {
    nullifierHash: deposit.nullifierHash,
    // public
    relayer: data.relayer ? data.relayer : bufferToFixed(0),
    recipient: data.recipient,
    fee: data.fee || 0,
    refund: data.refund || 0,

    // private
    nullifier: deposit.nullifier,
    secret: deposit.secret,
  };
}
