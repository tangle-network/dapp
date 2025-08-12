import { BN } from '@polkadot/util';
import { useCallback } from 'react';
import { TxName } from '../../constants';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import RESTAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/restaking';
import {
  isEvmAddress,
  convertAddressToBytes32,
  formatDisplayAmount,
  AmountFormatStyle,
} from '@tangle-network/ui-components';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import {
  ZERO_ADDRESS,
  PrecompileAddress,
} from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

type Context = {
  operatorAccountId: SubstrateAddress;
  assetId: RestakeAssetId;
  amount: BN;
  blueprintSelection?: BN[];
  isNominatedAsset?: boolean;
};

const useRestakeDelegateTx = () => {
  const { assets } = useRestakeAssets();

  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'delegate' | 'delegateNomination',
    Context
  > = useCallback(
    (context) => ({
      functionName: context.isNominatedAsset
        ? 'delegateNomination'
        : 'delegate',
      arguments: context.isNominatedAsset
        ? [
            convertAddressToBytes32(context.operatorAccountId),
            BigInt(context.amount.toString()),
            context.blueprintSelection?.map((id) => BigInt(id.toString())) ??
              [],
          ]
        : [
            convertAddressToBytes32(context.operatorAccountId),
            isEvmAddress(context.assetId) ? BigInt(0) : BigInt(context.assetId),
            isEvmAddress(context.assetId) ? context.assetId : ZERO_ADDRESS,
            BigInt(context.amount.toString()),
            context.blueprintSelection?.map((id) => BigInt(id.toString())) ??
              [],
          ],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      if (context.isNominatedAsset) {
        return api.tx.multiAssetDelegation.delegateNomination(
          context.operatorAccountId,
          context.amount,
          { Fixed: context.blueprintSelection ?? [] },
        );
      } else {
        const assetIdEnum = isEvmAddress(context.assetId)
          ? { Erc20: context.assetId }
          : { Custom: new BN(context.assetId) };

        return api.tx.multiAssetDelegation.delegate(
          context.operatorAccountId,
          assetIdEnum,
          context.amount,
          { Fixed: context.blueprintSelection ?? [] },
        );
      }
    },
    [],
  );

  const getSuccessMessage: GetSuccessMessageFn<Context> = useCallback(
    ({ assetId, amount }) => {
      const asset = assets?.get(assetId);
      const symbol = asset?.metadata.symbol ?? '';
      const decimals = asset?.metadata.decimals ?? 0;
      const formattedAmount = formatDisplayAmount(
        amount,
        decimals,
        AmountFormatStyle.EXACT,
      );
      return `Delegated ${formattedAmount} ${symbol}.`;
    },
    [assets],
  );

  return useAgnosticTx({
    name: TxName.RESTAKE_DELEGATE,
    precompileAddress: PrecompileAddress.RESTAKING,
    abi: RESTAKING_PRECOMPILE_ABI,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useRestakeDelegateTx;
