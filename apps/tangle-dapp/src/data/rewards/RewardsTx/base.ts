import { TxEventHandlers } from '@webb-tools/abstract-api-provider/transaction-events';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import { Hash } from 'viem';

export type ClaimRewardsArgs = {
  assetIds: RestakeAssetId[];
};

abstract class RewardsTxBase {
  abstract claimRewards(
    args: ClaimRewardsArgs,
    eventHandlers?: Partial<TxEventHandlers<ClaimRewardsArgs>>,
  ): Promise<Hash | null>;
}

export default RewardsTxBase;
