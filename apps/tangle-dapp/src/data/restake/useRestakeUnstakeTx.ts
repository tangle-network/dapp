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
import {
  convertAddressToBytes32,
  isEvmAddress,
} from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

type Context = {
  operatorAddress: SubstrateAddress;
  assetId: RestakeAssetId;
  amount: BN;
};

const useRestakeUnstakeTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'scheduleDelegatorUnstake',
    Context
  > = useCallback(({ assetId, amount, operatorAddress }) => {
    const customAssetId = isEvmAddress(assetId) ? 0 : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    return {
      functionName: 'scheduleDelegatorUnstake',
      arguments: [
        convertAddressToBytes32(operatorAddress),
        customAssetId,
        tokenAddress,
        BigInt(amount.toString()),
      ],
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, { operatorAddress, assetId, amount }) => {
      const assetIdEnum = isEvmAddress(assetId)
        ? { Erc20: assetId }
        : { Custom: new BN(assetId) };

      return api.tx.multiAssetDelegation.scheduleDelegatorUnstake(
        operatorAddress,
        assetIdEnum,
        amount,
      );
    },
    [],
  );

  return useAgnosticTx({
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    name: TxName.RESTAKE_UNSTAKE,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useRestakeUnstakeTx;
