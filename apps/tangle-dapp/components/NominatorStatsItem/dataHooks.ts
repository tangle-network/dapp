import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmountSubscription';

const dataHooks = {
  'Wallet Balance': useTokenWalletBalance,
  'Total Staked': useTotalStakedAmountSubscription,
  'Unbonding Amount': useUnbondingAmountSubscription,
} as const;

export default dataHooks;
