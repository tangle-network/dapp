import { BN } from '@polkadot/util';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import convertAddressToBytes32 from '@tangle-network/ui-components/utils/convertAddressToBytes32';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFn, StakingRewardsDestination } from '../../types';
import optimizeTxBatch from '@tangle-network/tangle-shared-ui/utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import getEvmPayeeValue from '../../utils/staking/getEvmPayeeValue';
import getSubstratePayeeValue from '../../utils/staking/getSubstratePayeeValue';
import BATCH_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/batch';
import STAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/staking';
import { assertBytes32 } from '@tangle-network/ui-components';

export type NominationOptionsContext = {
  bondAmount: BN;
  payee: StakingRewardsDestination;
  nominees: Set<SubstrateAddress>;
};

const useSetupNominatorTx = () => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<
    typeof BATCH_PRECOMPILE_ABI,
    'batchAll',
    NominationOptionsContext
  > = useCallback((context) => {
    const payee = getEvmPayeeValue(context.payee);

    // TODO: Are we missing adding all the EVM addresses for the other reward destinations?
    if (payee === null) {
      throw new Error(
        'There is no EVM destination address registered for the given payee',
      );
    }

    const bondCall = createEvmBatchCall(
      STAKING_PRECOMPILE_ABI,
      PrecompileAddress.STAKING,
      'bond',
      [BigInt(context.bondAmount.toString()), assertBytes32(payee)],
    );

    const evmNomineeAddresses32 = Array.from(context.nominees).map(
      convertAddressToBytes32,
    );

    const nominateCall = createEvmBatchCall(
      STAKING_PRECOMPILE_ABI,
      PrecompileAddress.STAKING,
      'nominate',
      [evmNomineeAddresses32],
    );

    return {
      functionName: 'batchAll',
      arguments: createEvmBatchCallArgs([bondCall, nominateCall]),
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<NominationOptionsContext> =
    useCallback((api, _activeSubstrateAddress, context) => {
      const payee = getSubstratePayeeValue(context.payee);

      return optimizeTxBatch(api, [
        api.tx.staking.bond(context.bondAmount, payee),
        api.tx.staking.nominate(Array.from(context.nominees)),
      ]);
    }, []);

  const getSuccessMessage: GetSuccessMessageFn<NominationOptionsContext> =
    useCallback(
      ({ bondAmount, nominees }) =>
        `Successfully nominated ${formatNativeTokenAmount(bondAmount)} to ${
          nominees.size
        } validators.`,
      [formatNativeTokenAmount],
    );

  return useAgnosticTx({
    name: TxName.SETUP_NOMINATOR,
    abi: BATCH_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.BATCH,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
  });
};

export default useSetupNominatorTx;
