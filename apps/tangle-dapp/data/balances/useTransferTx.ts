import { BN } from '@polkadot/util';
import { isAddress } from '@polkadot/util-crypto';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { AbiCall, EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import useEvmPrecompileFeeFetcher from '../../hooks/useEvmPrecompileFee';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFunctionType } from '../../types';
import { toEvmAddress20, toSubstrateAddress } from '../../utils';

type TransferTxContext = {
  receiverAddress: string;
  amount: BN;
  maxAmount: BN;
};

const useTransferTx = () => {
  const { fetchEvmPrecompileFees } = useEvmPrecompileFeeFetcher();
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<
    Precompile.BALANCES_ERC20,
    TransferTxContext
  > = useCallback(
    async ({ receiverAddress, amount, maxAmount }) => {
      const isMaxAmount = amount.eq(maxAmount);

      const recipientEvmAddress20 = isAddress(receiverAddress)
        ? toEvmAddress20(receiverAddress)
        : receiverAddress;

      const sharedAbiCallData: AbiCall<Precompile.BALANCES_ERC20> = {
        functionName: 'transfer',
        arguments: [recipientEvmAddress20, amount],
      };

      // If the amount to transfer is not the maximum amount
      // just return the abi call data for the transfer function.
      if (!isMaxAmount) {
        return sharedAbiCallData;
      }

      // Otherwise, fetch the fees for the transfer and subtract them from
      // the maximum amount to get the actual amount to transfer.
      const fees = await fetchEvmPrecompileFees(
        Precompile.BALANCES_ERC20,
        sharedAbiCallData
      );

      if (fees === null) {
        return sharedAbiCallData;
      }

      const { gas, maxFeePerGas } = fees;

      if (maxFeePerGas === undefined) {
        return sharedAbiCallData;
      }

      const txFee = new BN((gas * maxFeePerGas).toString());
      const amountToTransfer = amount.sub(txFee);

      return {
        ...sharedAbiCallData,
        arguments: [recipientEvmAddress20, amountToTransfer],
      };
    },
    [fetchEvmPrecompileFees]
  );

  const substrateTxFactory: SubstrateTxFactory<TransferTxContext> = useCallback(
    async (
      api,
      _activeSubstrateAddress,
      { receiverAddress, amount, maxAmount }
    ) => {
      // Convert the EVM address to a Substrate address, in case
      // that it was provided as an EVM address.
      const recipientSubstrateAddress = toSubstrateAddress(receiverAddress);

      return amount.eq(maxAmount)
        ? api.tx.balances.transferAll(
            recipientSubstrateAddress,
            // No need to keep the current account alive
            false
          )
        : // By 'allow death' it means that the transfer will not
          // be canceled if that transfer would cause the sender's
          // account to drop below the existential deposit, which
          // would essentially cause the account to be 'reaped', or
          // deleted from the chain.
          api.tx.balances.transferAllowDeath(recipientSubstrateAddress, amount);
    },
    []
  );

  const getSuccessMessageFnc: GetSuccessMessageFunctionType<TransferTxContext> =
    useCallback(
      ({ receiverAddress, amount }) =>
        `Successfully transferred ${formatNativeTokenAmount(
          amount
        )} to ${shortenString(receiverAddress)}.`,
      [formatNativeTokenAmount]
    );

  return useAgnosticTx<Precompile.BALANCES_ERC20, TransferTxContext>({
    name: TxName.TRANSFER,
    precompile: Precompile.BALANCES_ERC20,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessageFnc,
  });
};

export default useTransferTx;
