import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import { DelegatorInfo } from '@webb-tools/tangle-shared-ui/types/restake';

const calculateRestakeAvailableBalance = (
  delegatorInfo: DelegatorInfo,
  assetId: RestakeAssetId,
): bigint | null => {
  const depositEntry = delegatorInfo.deposits[assetId];

  if (depositEntry === undefined) {
    return null;
  }

  const deposit = depositEntry.amount;
  const delegated = depositEntry.delegatedAmount;
  const available = deposit - delegated;

  return available;
};

export default calculateRestakeAvailableBalance;
