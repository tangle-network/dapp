import useTokenWalletFreeBalance from '../../data/NominatorStats/useTokenWalletFreeBalance';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmountSubscription';

const dataHooks = {
  'Wallet Balance': useTokenWalletFreeBalance,
  'Total Staked': useTotalStakedAmountSubscription,
  'Unbonding Amount': useUnbondingAmountSubscription,
} as const;

export default dataHooks;
