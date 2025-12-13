import { useCallback } from 'react';
import { toHex } from 'viem';
import useEvmPrecompileCall, {
  EvmTxFactory,
} from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import CREDITS_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/credits';
import EVMChainId from '@tangle-network/dapp-types/EVMChainId';
import { useChainId } from 'wagmi';

type Context = {
  amountToClaim: bigint;
  offchainAccountId: string;
};

const CREDITS_SUPPORTED_EVM_CHAIN_IDS = new Set<number>([
  EVMChainId.TangleLocalEVM,
  EVMChainId.TangleTestnetEVM,
  EVMChainId.TangleMainnetEVM,
]);

const useClaimCreditsTx = () => {
  const chainId = useChainId();
  const isSupportedNetwork = CREDITS_SUPPORTED_EVM_CHAIN_IDS.has(chainId);

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

  const tx = useEvmPrecompileCall(
    CREDITS_PRECOMPILE_ABI,
    PrecompileAddress.CREDITS,
    evmTxFactory,
    () => 'Credits claimed successfully',
  );

  return {
    ...tx,
    execute: isSupportedNetwork ? tx.execute : null,
  };
};

export default useClaimCreditsTx;
