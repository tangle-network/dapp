import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
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

  const delegated = delegatorInfo.delegations
    .filter((delegation) => delegation.assetId === assetId)
    .reduce((acc, delegation) => acc + delegation.amountBonded, ZERO_BIG_INT);

  const available = deposit - delegated;

  return available;
};

export default calculateRestakeAvailableBalance;
