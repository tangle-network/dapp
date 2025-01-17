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
import {
  convertAddressToBytes32,
  isEvmAddress,
} from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';

type Context = {
  operatorAddress: SubstrateAddress;
  assetId: RestakeAssetId;
  amount: BN;
  blueprintSelection?: BN[];
};

const useRestakeDelegateTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'delegate',
    Context
  > = useCallback(
    ({ assetId, amount, operatorAddress, blueprintSelection }) => {
      const customAssetId = isEvmAddress(assetId) ? 0 : BigInt(assetId);
      const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

      return {
        functionName: 'delegate',
        arguments: [
          convertAddressToBytes32(operatorAddress),
          customAssetId,
          tokenAddress,
          BigInt(amount.toString()),
          blueprintSelection?.map((id) => BigInt(id.toString())) ?? [],
        ],
      };
    },
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (
      api,
      _activeSubstrateAddress,
      { operatorAddress, assetId, amount, blueprintSelection },
    ) => {
      const assetIdEnum = isEvmAddress(assetId)
        ? { Erc20: assetId }
        : { Custom: new BN(assetId) };

      const blueprintSelectionEnum =
        blueprintSelection === undefined
          ? { All: 'All' }
          : { Fixed: blueprintSelection };

      // TODO: Evm address & lock multiplier.
      return api.tx.multiAssetDelegation.delegate(
        operatorAddress,
        assetIdEnum,
        amount,
        blueprintSelectionEnum,
      );
    },
    [],
  );

  return useAgnosticTx({
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    name: TxName.RESTAKE_DELEGATE,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useRestakeDelegateTx;
