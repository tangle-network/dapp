import { useCallback } from 'react';
import { toHex } from 'viem';
import useEvmPrecompileCall, {
  EvmTxFactory,
} from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import CREDITS_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/credits';

type Context = {
  amountToClaim: bigint;
  offchainAccountId: string;
};

const useClaimCreditsTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof CREDITS_PRECOMPILE_ABI,
    'claim_credits',
    Context
  > = useCallback((context) => {
    return {
      functionName: 'claim_credits',
      arguments: [
        context.amountToClaim,
        toHex(new TextEncoder().encode(context.offchainAccountId)),
      ],
    };
  }, []);

  return useEvmPrecompileCall(
    CREDITS_PRECOMPILE_ABI,
    PrecompileAddress.CREDITS,
    evmTxFactory,
    () => 'Credits claimed successfully',
  );
};

export default useClaimCreditsTx;
