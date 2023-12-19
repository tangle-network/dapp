import usePaymentDestinationSubscription from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmountSubscription';

const dataHooks = {
  'Wallet Balance': useTokenWalletBalance,
  'Total Staked': useTotalStakedAmountSubscription,
  'Payment Destination': usePaymentDestinationSubscription,
  'Unbonding Amount': useUnbondingAmountSubscription,
} as const;

export default dataHooks;
