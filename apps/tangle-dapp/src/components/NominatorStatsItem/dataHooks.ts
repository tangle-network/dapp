import useTokenWalletFreeBalance from '../../data/NominatorStats/useTokenWalletFreeBalance';
import useTotalPayoutRewards from '../../data/NominatorStats/useTotalPayoutRewards';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmount';

const dataHooks = {
  'Wallet Balance': useTokenWalletFreeBalance,
  'Total Staked': useTotalStakedAmountSubscription,
  'Unbonding Amount': useUnbondingAmountSubscription,
  'Total Payout Rewards': useTotalPayoutRewards,
} as const;

export default dataHooks;
