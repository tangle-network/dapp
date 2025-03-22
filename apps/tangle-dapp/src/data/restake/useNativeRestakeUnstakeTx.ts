import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import RESTAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/restaking';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { convertAddressToBytes32 } from '@tangle-network/ui-components';

type Context = {
  amount: BN;
  operatorAddress: SubstrateAddress;
};

const useNativeRestakeUnstakeTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'scheduleDelegatorNominationUnstake',
    Context
  > = useCallback(
    (context) => ({
      functionName: 'scheduleDelegatorNominationUnstake',
      arguments: [
        convertAddressToBytes32(context.operatorAddress),
        BigInt(context.amount.toString()),
        // TODO: Blueprint selection. For now, defaulting to none.
        [],
      ],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.multiAssetDelegation.scheduleNominationUnstake(
        context.operatorAddress,
        context.amount,
        // TODO: Blueprint selection. For now, unstake from all.
        { All: 'All' },
      ),
    [],
  );

  return useAgnosticTx({
    name: TxName.RESTAKE_NATIVE_UNSTAKE,
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useNativeRestakeUnstakeTx;
