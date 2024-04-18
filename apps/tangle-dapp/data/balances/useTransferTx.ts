import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import { EvmAbiCallData, EvmTxFactory } from '../../hooks/types';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import useEvmPrecompileFeeFetcher from '../../hooks/useEvmPrecompileFee';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { evmToSubstrateAddress, substrateToEvmAddress } from '../../utils';

type TransferTxContext = {
  receiverAddress: string;
  amount: BN;
  maxAmount: BN;
};

const useTransferTx = () => {
  const { fetchEvmPrecompileFees } = useEvmPrecompileFeeFetcher();

  const evmTxFactory: EvmTxFactory<
    Precompile.BALANCES_ERC20,
    TransferTxContext
  > = useCallback(
    async ({ receiverAddress, amount, maxAmount }) => {
      const isMaxAmount = amount.eq(maxAmount);
      const receiverEvm = substrateToEvmAddress(receiverAddress);

      const sharedAbiCallData = {
        functionName: 'transfer',
        arguments: [receiverEvm, amount],
      } satisfies EvmAbiCallData<Precompile.BALANCES_ERC20>;

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
        arguments: [receiverEvm, amountToTransfer],
      };
    },
    [fetchEvmPrecompileFees]
  );

  const substrateTxFactory: SubstrateTxFactory<TransferTxContext> = useCallback(
    async (
      api,
      _activeSubstrateAddress,
      { receiverAddress, amount, maxAmount }
    ) =>
      amount.eq(maxAmount)
        ? api.tx.balances.transferAll(
            // Convert the EVM address to a Substrate address, in case
            // that it was provided as an EVM address.
            evmToSubstrateAddress(receiverAddress),
            // No need to keep the current account alive
            false
          )
        : // By 'allow death' it means that the transfer will not
          // be canceled if that transfer would cause the sender's
          // account to drop below the existential deposit, which
          // would essentially cause the account to be 'reaped', or
          // deleted from the chain.
          api.tx.balances.transferAllowDeath(
            // Convert the EVM address to a Substrate address, in case
            // that it was provided as an EVM address.
            evmToSubstrateAddress(receiverAddress),
            amount
          ),
    []
  );

  return useAgnosticTx<Precompile.BALANCES_ERC20, TransferTxContext>({
    precompile: Precompile.BALANCES_ERC20,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useTransferTx;
