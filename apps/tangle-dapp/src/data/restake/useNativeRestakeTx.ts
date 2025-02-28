import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import RESTAKING_PRECOMPILE_ABI from '../../abi/restaking';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { convertAddressToBytes32 } from '@tangle-network/ui-components';

type Context = {
  amount: BN;
  operatorAddress: SubstrateAddress;
};

const useNativeRestakeTx = () => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'delegateNomination',
    Context
  > = useCallback(
    (context) => ({
      functionName: 'delegateNomination',
      arguments: [
        convertAddressToBytes32(context.operatorAddress),
        BigInt(context.amount.toString()),
        // TODO: Blueprint selection.
        [],
      ],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.multiAssetDelegation.delegateNomination(
        context.operatorAddress,
        context.amount,
        // TODO: Blueprint selection.
        { All: 'All' },
      ),
    [],
  );

  const getSuccessMessage: GetSuccessMessageFn<Context> = useCallback(
    ({ amount }) => `Successfully rebonded ${formatNativeTokenAmount(amount)}.`,
    [formatNativeTokenAmount],
  );

  return useAgnosticTx({
    name: TxName.RESTAKE_NATIVE,
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
  });
};

export default useNativeRestakeTx;
