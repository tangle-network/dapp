import { TxStatus } from '../hooks/useTx';

function getTxStatusText(status: TxStatus) {
  switch (status) {
    case TxStatus.NotYetInitiated:
      return 'Not initiated';
    case TxStatus.Processing:
      return 'Processing';
    case TxStatus.Error:
      return 'Error';
    case TxStatus.Complete:
      return 'Complete';
    case TxStatus.TimedOut:
      return 'Timed out';
  }
}

export default getTxStatusText;
