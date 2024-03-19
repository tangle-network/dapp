import { TxStatus } from '../hooks/useSubstrateTx';

function getTxStatusText(status: TxStatus) {
  switch (status) {
    case TxStatus.NOT_YET_INITIATED:
      return 'Not initiated';
    case TxStatus.PROCESSING:
      return 'Processing';
    case TxStatus.ERROR:
      return 'Error';
    case TxStatus.COMPLETE:
      return 'Complete';
    case TxStatus.TIMED_OUT:
      return 'Timed out';
  }
}

export default getTxStatusText;
