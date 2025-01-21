import { BN_ZERO } from '@polkadot/util';
import { TYPE_REGISTRY } from '@webb-tools/dapp-config/constants/polkadot';
import VipDiamondLine from '@webb-tools/icons/VipDiamondLine';
import { TangleAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import { useMemo } from 'react';
import { formatUnits, zeroAddress } from 'viem';
import useAccountRewardInfo from '../../data/rewards/useAccountRewardInfo';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import ActionItem from './ActionItem';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';

export default function ClaimRewardAction() {
  const [activeChain] = useActiveChain();

  const { isEvm } = useAgnosticAccountInfo();

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

  if (!hasClaimableReward || nativeClaimableAmount === null || !activeChain) {
    return null;
  }

  return (
    <ActionItem
      Icon={VipDiamondLine}
      label="Unclaimed Rewards"
      hasNotificationDot
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
