import { useCallback } from 'react';
import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import optimizeTxBatch from '@tangle-network/tangle-shared-ui/utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import BATCH_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/batch';
import STAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/staking';
import convertAddressToBytes32 from '@tangle-network/ui-components/utils/convertAddressToBytes32';
import { toSubstrateAddress } from '@tangle-network/ui-components';
import { shortenString } from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';

export const MAX_PAYOUTS_BATCH_SIZE = 20;

type Context = {
  validatorAddress: string;
  eras: number[];
};

const usePayoutStakersTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof BATCH_PRECOMPILE_ABI,
    'batchAll',
    Context
  > = useCallback((context) => {
    const sortedEras = [...context.eras].sort((a, b) => a - b);

    // Convert validator address to 32-byte format for EVM
    const validatorEvmAddress32 = convertAddressToBytes32(
      context.validatorAddress,
    );

    // Create batch of payoutStakers calls for each era
    const payoutCalls = sortedEras.map((era) => {
      return createEvmBatchCall(
        STAKING_PRECOMPILE_ABI,
        PrecompileAddress.STAKING,
        'payoutStakers',
        [validatorEvmAddress32, era],
      );
    });

    return {
      functionName: 'batchAll',
      arguments: createEvmBatchCallArgs(payoutCalls),
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, _activeSubstrateAddress, context) => {
      const validatorSubstrateAddress = toSubstrateAddress(
        context.validatorAddress,
      );

      const sortedEras = [...context.eras].sort((a, b) => a - b);

      // Get current era to validate
      const currentEra = await api.query.staking.currentEra();
      const currentEraNumber = currentEra.unwrapOrDefault().toNumber();

      // Validate eras
      const validEras = sortedEras.filter((era) => {
        const isValid = era < currentEraNumber;
        if (!isValid) {
          console.warn(
            `Skipping invalid era ${era} (current era: ${currentEraNumber})`,
          );
        }
        return isValid;
      });

      if (validEras.length === 0) {
        throw new Error('No valid eras to claim rewards for');
      }

      // Create batch of payoutStakers calls for each valid era
      const payoutCalls = validEras.map((era) => {
        console.log('Creating payoutStakers call for era:', era);
        return api.tx.staking.payoutStakers(validatorSubstrateAddress, era);
      });

      return optimizeTxBatch(api, payoutCalls);
    },
    [],
  );

  const getSuccessMessage: GetSuccessMessageFn<Context> = useCallback(
    ({ eras, validatorAddress }) => {
      const eraCount = eras.length;
      return `Successfully claimed rewards for ${eraCount} ${pluralize('era', eraCount !== 1)} from validator ${shortenString(validatorAddress, 8)}`;
    },
    [],
  );

  return useAgnosticTx({
    name: TxName.PAYOUT_STAKERS,
    abi: BATCH_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.BATCH,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
  });
};

export default usePayoutStakersTx;
