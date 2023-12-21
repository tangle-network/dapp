import usePaymentDestinationSubscription from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';

const dataHooks = {
  'Wallet Balance': useTokenWalletBalance,
  'Total Staked': useTotalStakedAmountSubscription,
  'Payment Destination': usePaymentDestinationSubscription,
} as const;

export default dataHooks;
