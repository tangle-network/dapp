import { BN } from '@polkadot/util';
import { useCallback } from 'react';
import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import RESTAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/restaking';
import {
  isEvmAddress,
  formatDisplayAmount,
  AmountFormatStyle,
} from '@tangle-network/ui-components';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import { ZERO_ADDRESS } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';

type Context = {
  assetId: RestakeAssetId;
  amount: BN;
};

const useRestakeDepositTx = () => {
  const { assets } = useRestakeAssets();

  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'deposit',
    Context
  > = useCallback(
    (context) => ({
      functionName: 'deposit',
      arguments: [
        isEvmAddress(context.assetId) ? BigInt(0) : BigInt(context.assetId),
        isEvmAddress(context.assetId) ? context.assetId : ZERO_ADDRESS,
        BigInt(context.amount.toString()),
        0,
      ],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const assetIdEnum = isEvmAddress(context.assetId)
        ? { Erc20: context.assetId }
        : { Custom: new BN(context.assetId) };

      return api.tx.multiAssetDelegation.deposit(
        assetIdEnum,
        context.amount,
        null,
        null,
      );
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
      return `Deposited ${formattedAmount} ${symbol}.`;
    },
    [assets],
  );

  return useAgnosticTx({
    name: TxName.RESTAKE_DEPOSIT,
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
    isEvmTxRelayerSubsidized: true,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useRestakeDepositTx;
