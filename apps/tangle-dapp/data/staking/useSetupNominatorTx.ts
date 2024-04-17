import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { StakingRewardsDestination } from '../../types';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCallData from '../../utils/staking/createEvmBatchCallData';
import getEvmPayeeValue from '../../utils/staking/getEvmPayeeValue';
import getSubstratePayeeValue from '../../utils/staking/getSubstratePayeeValue';
import toEvmAddress32 from '../../utils/toEvmAddress32';

export type NominationOptions = {
  bondAmount: BN;
  payee: StakingRewardsDestination;
  nominees: string[];
};

const useSetupNominatorTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.BATCH, NominationOptions> =
    useCallback((context) => {
      const payee = getEvmPayeeValue(context.payee);

      // TODO: Are we missing adding all the EVM addresses for the other reward destinations?
      if (payee === null) {
        throw new Error(
          'There is no EVM destination address registered for the given payee'
        );
      }

      const bondCall = createEvmBatchCallData(Precompile.STAKING, 'bond', [
        BigInt(context.bondAmount.toString()),
        payee,
      ]);

      const evmNomineeAddresses32 = context.nominees.map(toEvmAddress32);

      const nominateCall = createEvmBatchCallData(
        Precompile.STAKING,
        'nominate',
        [evmNomineeAddresses32]
      );

      return {
        functionName: 'batchAll',
        arguments: createEvmBatchCallArgs([bondCall, nominateCall]),
      };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<NominationOptions> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const payee = getSubstratePayeeValue(context.payee);

      return optimizeTxBatch(api, [
        api.tx.staking.bond(context.bondAmount, payee),
        api.tx.staking.nominate(context.nominees),
      ]);
    },
    []
  );

  return useAgnosticTx<Precompile.BATCH, NominationOptions>({
    name: TxName.SETUP_NOMINATOR,
    precompile: Precompile.BATCH,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useSetupNominatorTx;
