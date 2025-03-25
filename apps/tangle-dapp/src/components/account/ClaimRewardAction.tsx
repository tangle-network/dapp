import Spinner from '@tangle-network/icons/Spinner';
import { IconBase } from '@tangle-network/icons/types';
import VipDiamondLine from '@tangle-network/icons/VipDiamondLine';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import useClaimRewardsTx from '../../data/rewards/useClaimRewardsTx';
import ActionItem from './ActionItem';

type Props<RefetchArgs, Result> = {
  claimableAssets: Map<RestakeAssetId, bigint>;
  refetchReward: (...args: RefetchArgs[]) => Promise<Result>;
};

export default function ClaimRewardAction<RefetchArgs, Result>({
  claimableAssets,
  refetchReward,
}: Props<RefetchArgs, Result>) {
  const { execute, status } = useClaimRewardsTx();

  const handleClick = useCallback(async () => {
    if (execute === null) {
      return null;
    }

    await execute({ assetIds: Array.from(claimableAssets.keys()) });

    await refetchReward();
  }, [claimableAssets, execute, refetchReward]);

  const isLoading = useMemo(() => status === TxStatus.PROCESSING, [status]);

  return (
    <ActionItem
      Icon={isLoading ? SpinnerIcon : VipDiamondLine}
      iconSize="md"
      isDisabled={isLoading}
      onClick={handleClick}
    />
  );
}

const SpinnerIcon = (props: IconBase) => {
  return (
    <Spinner
      {...props}
      className={twMerge('min-w-6 min-h-6', props.className)}
    />
  );
};
