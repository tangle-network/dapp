import Spinner from '@webb-tools/icons/Spinner';
import { IconBase } from '@webb-tools/icons/types';
import VipDiamondLine from '@webb-tools/icons/VipDiamondLine';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import { useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import useClaimRewardsTx from '../../data/rewards/useClaimRewardsTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import ActionItem from './ActionItem';

type Props = {
  claimableAssets: Map<RestakeAssetId, bigint>;
  onPostClaim?: () => Promise<void> | void;
};

export default function ClaimRewardAction({
  claimableAssets,
  onPostClaim,
}: Props) {
  const { execute, status } = useClaimRewardsTx();

  const handleClick = useCallback(async () => {
    if (execute === null) {
      return null;
    }

    await execute({ assetIds: Array.from(claimableAssets.keys()) });

    onPostClaim?.();
  }, [claimableAssets, execute, onPostClaim]);

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
