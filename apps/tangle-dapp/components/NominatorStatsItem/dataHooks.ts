import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';

const dataHooks = {
  'Wallet Balance': useTokenWalletBalance,
  'Total Staked': useTotalStakedAmountSubscription,
} as const;

export default dataHooks;
