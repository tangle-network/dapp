import useTokenWalletFreeBalance from '../../data/nomination/useTokenWalletFreeBalance';
import useTotalPayoutRewards from '../../data/nomination/useTotalPayoutRewards';
import useTotalStakedAmountSubscription from '../../data/nomination/useTotalStakedAmountSubscription';
import useUnbondingAmountSubscription from '../../data/nomination/useUnbondingAmount';

const dataHooks = {
  'Wallet Balance': useTokenWalletFreeBalance,
  'Total Staked': useTotalStakedAmountSubscription,
  'Unbonding Amount': useUnbondingAmountSubscription,
  'Total Payout Rewards': useTotalPayoutRewards,
} as const;

export default dataHooks;
