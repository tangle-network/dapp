import { BN } from '@polkadot/util';
import {
  toEvmAddress,
  toSubstrateAddress,
} from '@tangle-network/ui-components';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import {
  PrecompileCall,
  EvmTxFactory,
} from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import useEvmPrecompileFeeFetcher from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileFee';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import BALANCES_ERC20_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/balancesErc20';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

type Context = {
  recipientAddress: SubstrateAddress | EvmAddress;
  amount: BN;
  maxAmount: BN;
};

const useTransferTx = () => {
  const { fetchEvmPrecompileFees } = useEvmPrecompileFeeFetcher();
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<
    typeof BALANCES_ERC20_PRECOMPILE_ABI,
    'transfer',
    Context
  > = useCallback(
    async ({ recipientAddress, amount, maxAmount }) => {
      const isMaxAmount = amount.eq(maxAmount);
      const recipientEvmAddress20 = toEvmAddress(recipientAddress);

      const sharedAbiCallData: PrecompileCall<
        typeof BALANCES_ERC20_PRECOMPILE_ABI,
        'transfer'
      > = {
        functionName: 'transfer',
        arguments: [recipientEvmAddress20, BigInt(amount.toString())],
      };

      // If the amount to transfer is not the maximum amount
      // just return the abi call data for the transfer function.
      if (!isMaxAmount) {
        return sharedAbiCallData;
      }

      // Otherwise, fetch the fees for the transfer and subtract them from
      // the maximum amount to get the actual amount to transfer.
      const fees = await fetchEvmPrecompileFees(
        BALANCES_ERC20_PRECOMPILE_ABI,
        PrecompileAddress.BALANCES_ERC20,
        sharedAbiCallData,
      );

      if (fees === null) {
        return sharedAbiCallData;
      }

      const { gas, maxFeePerGas } = fees;

      if (maxFeePerGas === undefined) {
        return sharedAbiCallData;
      }

      const txFee = new BN((gas * maxFeePerGas).toString());
      const amountMinusFee = amount.sub(txFee);

      return {
        ...sharedAbiCallData,
        arguments: [recipientEvmAddress20, BigInt(amountMinusFee.toString())],
      };
    },
    [fetchEvmPrecompileFees],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (
      api,
      _activeSubstrateAddress,
      { recipientAddress, amount, maxAmount },
    ) => {
      // Convert the EVM address to a Substrate address, in case
      // that it was provided as an EVM address.
      const recipientSubstrateAddress = toSubstrateAddress(recipientAddress);

      return amount.eq(maxAmount)
        ? api.tx.balances.transferAll(
            recipientSubstrateAddress,
            // No need to keep the current account alive
            false,
          )
        : // By 'allow death' it means that the transfer will not
          // be canceled if that transfer would cause the sender's
          // account to drop below the existential deposit, which
          // would essentially cause the account to be 'reaped', or
          // deleted from the chain.
          api.tx.balances.transferAllowDeath(recipientSubstrateAddress, amount);
    },
    [],
  );

  const getSuccessMessage: GetSuccessMessageFn<Context> = useCallback(
    ({ recipientAddress: receiverAddress, amount }) =>
      `Successfully transferred ${formatNativeTokenAmount(
        amount,
      )} to ${shortenString(receiverAddress)}.`,
    [formatNativeTokenAmount],
  );

  return useAgnosticTx({
    name: TxName.TRANSFER,
    abi: BALANCES_ERC20_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.BALANCES_ERC20,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useTransferTx;
