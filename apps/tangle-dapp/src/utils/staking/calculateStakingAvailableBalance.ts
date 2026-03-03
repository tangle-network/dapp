import { StakingAssetId } from '@tangle-network/tangle-shared-ui/types/staking';
import type { StakingDelegatorInfo } from '@tangle-network/tangle-shared-ui/types/staking';

const calculateStakingAvailableBalance = (
  delegatorInfo: StakingDelegatorInfo,
  assetId: StakingAssetId,
): bigint | null => {
  const depositEntry = delegatorInfo.deposits[assetId];

  if (depositEntry === undefined) {
    return null;
  }

  const deposit =
    typeof depositEntry.amount === 'bigint'
      ? depositEntry.amount
      : BigInt(depositEntry.amount);
  const delegated =
    typeof depositEntry.delegatedAmount === 'bigint'
      ? depositEntry.delegatedAmount
      : BigInt(depositEntry.delegatedAmount);
  const available = deposit - delegated;

  return BigInt(available);
};

export default calculateStakingAvailableBalance;
