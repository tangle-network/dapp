import RESTAKING_PRECOMPILE_ABI from '../../abi/restaking';
import { TxName } from '../../constants';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { BN } from '@polkadot/util';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { useCallback } from 'react';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import {
  PrecompileAddress,
  ZERO_ADDRESS,
} from '../../constants/evmPrecompiles';
import { isEvmAddress } from '@webb-tools/webb-ui-components';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';

type Context = {
  assetId: RestakeAssetId;
  amount: BN;
};

const useRestakeDepositTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'deposit',
    Context
  > = useCallback(({ assetId, amount }) => {
    const assetIdBigInt = isEvmAddress(assetId) ? 0 : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    return {
      functionName: 'deposit',
      // TODO: Lock multiplier.
      arguments: [assetIdBigInt, tokenAddress, BigInt(amount.toString()), 0],
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, { assetId, amount }) => {
      const assetIdObj = isEvmAddress(assetId)
        ? { Erc20: assetId }
        : { Custom: new BN(assetId) };

      // TODO: Evm address & lock multiplier.
      return api.tx.multiAssetDelegation.deposit(
        assetIdObj,
        amount,
        null,
        null,
      );
    },
    [],
  );

  return useAgnosticTx({
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    name: TxName.RESTAKE_DEPOSIT,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useRestakeDepositTx;
