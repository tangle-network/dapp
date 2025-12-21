import { useMemo } from 'react';
import { Address, Hex, keccak256, toHex, zeroAddress } from 'viem';
import { useChainId } from 'wagmi';
import useContractWrite, {
  TxStatus as ContractTxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { TxStatus as SubstrateTxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import CREDITS_MERKLE_ABI from '@tangle-network/tangle-shared-ui/abi/creditsMerkle';
import { resolveCreditsAddress } from './resolveCreditsAddress';

type Context = {
  epochId: bigint;
  amountToClaim: bigint;
  offchainAccountId: string;
  merkleProof: Hex[];
};

const useClaimCreditsTx = () => {
  const chainId = useChainId();
  const creditsAddress = resolveCreditsAddress(chainId);
  const isSupportedNetwork = creditsAddress !== null;

  const contractTx = useContractWrite(
    CREDITS_MERKLE_ABI,
    (context: Context) => ({
      address: (creditsAddress ?? zeroAddress) as Address,
      abi: CREDITS_MERKLE_ABI,
      functionName: 'claim' as const,
      args: [
        context.epochId,
        context.amountToClaim,
        encodeOffchainAccountId(context.offchainAccountId),
        context.merkleProof,
      ] as const,
    }),
    {
      txName: 'claim credits',
      getSuccessMessage: () => 'Credits claimed successfully',
    },
  );

  const mappedContractStatus = useMemo(() => {
    switch (contractTx.status) {
      case ContractTxStatus.NOT_YET_INITIATED:
        return SubstrateTxStatus.NOT_YET_INITIATED;
      case ContractTxStatus.PROCESSING:
        return SubstrateTxStatus.PROCESSING;
      case ContractTxStatus.COMPLETE:
        return SubstrateTxStatus.COMPLETE;
      case ContractTxStatus.ERROR:
        return SubstrateTxStatus.ERROR;
      default:
        return SubstrateTxStatus.NOT_YET_INITIATED;
    }
  }, [contractTx.status]);

  return {
    ...contractTx,
    status: mappedContractStatus,
    execute: isSupportedNetwork ? contractTx.execute : null,
  };
};

export default useClaimCreditsTx;

const encodeOffchainAccountId = (value: string): Hex => {
  const trimmed = value.trim();
  if (!trimmed) {
    return ('0x' + '00'.repeat(32)) as Hex;
  }

  const bytes = new TextEncoder().encode(trimmed);
  if (bytes.length <= 32) {
    return toHex(bytes, { size: 32 });
  }

  return keccak256(toHex(bytes));
};
