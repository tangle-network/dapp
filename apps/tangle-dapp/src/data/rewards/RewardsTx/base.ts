import { TxEventHandlers } from '@webb-tools/abstract-api-provider/transaction-events';
import { TangleAssetId } from '@webb-tools/tangle-shared-ui/types';
import { Hash } from 'viem';

abstract class RewardsTxBase {
  abstract claimRewards<ArgsType extends { assetId: TangleAssetId }>(
    args: ArgsType,
    eventHandlers?: Partial<TxEventHandlers<ArgsType>>,
  ): Promise<Hash | null>;
}

export default RewardsTxBase;
