import { ZKPTornInputWithMerkle, ZKPTornPublicInputs } from '@webb-dapp/contracts/contracts';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { Deposit } from '@webb-dapp/contracts/utils/make-deposit';

export type ZKPTornFromDepositInput = {
  relayer?: string;
  recipient: string;
  refund?: number;
  fee?: number;
};

export function fromDepositIntoZKPTornPublicInputs(
  deposit: Deposit,
  data: ZKPTornFromDepositInput
): ZKPTornPublicInputs {
  return {
    nullifierHash: deposit.nullifierHash,
    // public
    relayer: data.relayer ? data.relayer : bufferToFixed(0),
    recipient: data.recipient,
    fee: data.fee || 0,
    refund: data.refund || 0,
  };
}
