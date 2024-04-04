import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';

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
      arguments: [context.receiverAddress, context.amount],
    }),
    []
  );

  const substrateTxFactory: SubstrateTxFactory<TransferTxContext> = useCallback(
    async (api, _activeSubstrateAddress, context) =>
      // By 'keep alive' it means that the transfer will be
      // canceled if that transfer would cause the sender's
      // account to drop below the existential deposit, which
      // would otherwise essentially cause the account to be
      // 'reaped', or deleted from the chain.
      api.tx.balances.transferKeepAlive(
        context.receiverAddress,
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
