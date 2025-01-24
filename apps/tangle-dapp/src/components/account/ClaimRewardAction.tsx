import Spinner from '@webb-tools/icons/Spinner';
import { IconBase } from '@webb-tools/icons/types';
import VipDiamondLine from '@webb-tools/icons/VipDiamondLine';
import useTransactionInfo from '@webb-tools/tangle-shared-ui/hooks/useTransactionInfo';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { useCallback, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import useRewardsTx from '../../data/rewards/useRewardsTx';
import ActionItem from './ActionItem';

type Props = {
  claimableAssetIds: RestakeAssetId[];
};

export default function ClaimRewardAction({ claimableAssetIds }: Props) {
  const { notificationApi } = useWebbUI();
  const { claimRewards } = useRewardsTx();
  const { isLoading, error, eventHandlers } = useTransactionInfo();

  const handleClick = useCallback(async () => {
    await claimRewards({ assetIds: claimableAssetIds }, eventHandlers);
  }, [claimRewards, claimableAssetIds, eventHandlers]);

  useEffect(() => {
    if (!error) {
      return;
    }

    notificationApi.addToQueue({
      message: 'Failed to claim rewards',
      secondaryMessage: error,
      variant: 'error',
    });
  }, [error, notificationApi]);

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
