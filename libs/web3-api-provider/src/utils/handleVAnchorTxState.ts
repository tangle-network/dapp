import {
  NewNotesTxResult,
  TransactionExecutor,
  TransactionState,
} from '@webb-tools/abstract-api-provider';
import {
  TransactionStateUpdatePayload,
  TransactionState as VAnchorTxState,
} from '@webb-tools/anchors';

function handlehandleVAnchorTxState<State extends VAnchorTxState>(
  tx: TransactionExecutor<NewNotesTxResult>,
  txState: State,
  payload: TransactionStateUpdatePayload[State]
) {
  switch (txState) {
    case VAnchorTxState.GENERATE_ZK_PROOF: {
      tx.next(TransactionState.GeneratingZk, undefined);
      break;
    }
    case VAnchorTxState.INITIALIZE_TRANSACTION: {
      tx.next(TransactionState.InitializingTransaction, undefined);
      break;
    }
    case VAnchorTxState.WAITING_FOR_FINALIZATION: {
      tx.next(TransactionState.SendingTransaction, payload as string);
      break;
    }
    case VAnchorTxState.FINALIZED: {
      tx.next(TransactionState.Done, {
        txHash: payload as string,
        outputNotes: [],
      });
      break;
    }
    default: {
      console.error('Unknown handle transaction state', txState, payload);
      break;
    }
  }
}

export default handlehandleVAnchorTxState;
