import { useCallback } from 'react';
import { TxName } from '../../constants';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { BN } from '@polkadot/util';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import CREDITS_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/credits';

type Context = {
  amountToClaim: BN;
  githubUsername: string;
};

const useClaimGitHubCreditsTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof CREDITS_PRECOMPILE_ABI,
    'claimCredits',
    Context
  > = useCallback((context) => {
    return {
      functionName: 'claimCredits',
      arguments: [BigInt(context.amountToClaim.toString()), context.githubUsername],
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      // Based on the pallet specification: api.tx.credits.claim_credits(origin, amount_to_claim, offchain_account_id)
      return api.tx.credits.claimCredits(
        context.amountToClaim,
        context.githubUsername
      );
    },
    []
  );

  return useAgnosticTx({
    name: TxName.CLAIM_GITHUB_CREDITS,
    abi: CREDITS_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.CREDITS,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useClaimGitHubCreditsTx;