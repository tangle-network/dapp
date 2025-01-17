import RESTAKING_PRECOMPILE_ABI from '../../abi/restaking';
import { TxName } from '../../constants';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { RestakeAssetId } from '../../../../../libs/tangle-shared-ui/src/utils/createRestakeAssetId';
import { BN } from '@polkadot/util';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { useCallback } from 'react';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import {
  PrecompileAddress,
  ZERO_ADDRESS,
} from '../../constants/evmPrecompiles';
import { isEvmAddress } from '@webb-tools/webb-ui-components';

type Context = {
  assetId: RestakeAssetId;
  amount: BN;
};

const useRestakeWithdrawTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'scheduleWithdraw',
    Context
  > = useCallback(({ assetId, amount }) => {
    const customAssetId = isEvmAddress(assetId) ? 0 : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    return {
      functionName: 'scheduleWithdraw',
      arguments: [customAssetId, tokenAddress, BigInt(amount.toString())],
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, { assetId, amount }) => {
      const assetIdEnum = isEvmAddress(assetId)
        ? { Erc20: assetId }
        : { Custom: new BN(assetId) };

      return api.tx.multiAssetDelegation.scheduleWithdraw(assetIdEnum, amount);
    },
    [],
  );

  return useAgnosticTx({
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    name: TxName.RESTAKE_WITHDRAW,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useRestakeWithdrawTx;
