import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { evmToSubstrateAddress, substrateToEvmAddress } from '../../utils';

type TransferTxContext = {
  receiverAddress: string;
  amount: BN;
};

const useTransferTx = () => {
  const evmTxFactory: EvmTxFactory<
    Precompile.BALANCES_ERC20,
    TransferTxContext
  > = useCallback(
    (context) => ({
      functionName: 'transfer',
      arguments: [
        // Convert the Substrate address to an EVM address, in case
        // that it was provided as a Substrate address.
        substrateToEvmAddress(context.receiverAddress),
        context.amount,
      ],
    }),
    []
  );

  const substrateTxFactory: SubstrateTxFactory<TransferTxContext> = useCallback(
    async (api, _activeSubstrateAddress, context) =>
      // By 'allow death' it means that the transfer will not
      // be canceled if that transfer would cause the sender's
      // account to drop below the existential deposit, which
      // would essentially cause the account to be 'reaped', or
      // deleted from the chain.
      api.tx.balances.transferAllowDeath(
        // Convert the EVM address to a Substrate address, in case
        // that it was provided as an EVM address.
        evmToSubstrateAddress(context.receiverAddress),
        context.amount
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
