import { BN_ZERO } from '@polkadot/util';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { TYPE_REGISTRY } from '@webb-tools/dapp-config/constants/polkadot';
import Spinner from '@webb-tools/icons/Spinner';
import { IconBase } from '@webb-tools/icons/types';
import VipDiamondLine from '@webb-tools/icons/VipDiamondLine';
import useTransactionInfo from '@webb-tools/tangle-shared-ui/hooks/useTransactionInfo';
import { TangleAssetId } from '@webb-tools/tangle-shared-ui/types';
import { useCallback, useEffect, useMemo } from 'react';
import { formatUnits, zeroAddress } from 'viem';
import useAccountRewardInfo from '../../data/rewards/useAccountRewardInfo';
import useRewardsTx from '../../data/rewards/useRewardsTx';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import ActionItem from './ActionItem';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';

export default function ClaimRewardAction() {
  const { notificationApi } = useWebbUI();
  const [activeChain] = useActiveChain();
  const { isEvm } = useAgnosticAccountInfo();

  const { claimRewards } = useRewardsTx();
  const { isLoading, error, eventHandlers } = useTransactionInfo();

  // TODO: Add other assets in the future,
  // for now, we only support native asset
  const claimableAssets = useMemo<TangleAssetId[]>(() => {
    if (typeof isEvm !== 'boolean') {
      return [];
    } else if (isEvm === true) {
      return [
        {
          Erc20: zeroAddress,
        },
      ];
    } else {
      return [
        {
          Custom: TYPE_REGISTRY.createType('u128', 0),
        },
      ];
    }
  }, [isEvm]);

  const { result } = useAccountRewardInfo(claimableAssets);

  const hasClaimableReward = useMemo(() => {
    if (result === null || result.length === 0) {
      return false;
    }

    return result.some((reward) => reward.gt(BN_ZERO));
  }, [result]);

  const nativeClaimableAmount = useMemo(() => {
    if (!activeChain) {
      return null;
    }

    if (result === null || result.length === 0) {
      return null;
    }

    if (result[0].isZero()) {
      return null;
    }

    return formatUnits(
      result[0].toBigInt(),
      activeChain.nativeCurrency.decimals,
    );
  }, [activeChain, result]);

  const handleClick = useCallback(async () => {
    if (claimableAssets.length === 0) {
      return;
    }

    // TODO: We should support claim multiple assets in the future
    await claimRewards({ assetId: claimableAssets[0] }, eventHandlers);
  }, [claimRewards, claimableAssets, eventHandlers]);

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

  if (!hasClaimableReward || nativeClaimableAmount === null || !activeChain) {
    return null;
  }

  return (
    <ActionItem
      Icon={isLoading ? SpinnerIcon : VipDiamondLine}
      isDisabled={isLoading}
      label="Unclaimed Rewards"
      hasNotificationDot
      onClick={handleClick}
      tooltip={
        <>
          Congratulations! You have <strong>{nativeClaimableAmount}</strong>{' '}
          {activeChain.nativeCurrency.symbol}
          unclaimed rewards.
        </>
      }
    />
  );
}

const SpinnerIcon = (props: IconBase) => {
  return <Spinner {...props} />;
};
