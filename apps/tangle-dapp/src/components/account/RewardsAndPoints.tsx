import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import get from 'lodash/get';
import { useMemo } from 'react';
import { formatUnits, zeroAddress } from 'viem';
import useAssetsMetadata from '../../data/assets/useAssetsMetadata';
import useAccountRewardInfo from '../../data/rewards/useAccountRewardInfo';
import KeyStatsItem from '../KeyStatsItem/KeyStatsItem';
import ClaimRewardAction from './ClaimRewardAction';

const RewardsAndPoints = () => {
  const [activeChain] = useActiveChain();

  const { result, isLoading, error } = useAccountRewardInfo();

  const {
    result: assetsMetadata,
    isLoading: isAssetsMetadataLoading,
    error: assetsMetadataError,
  } = useAssetsMetadata(
    useMemo(() => Object.keys(result ?? {}) as RestakeAssetId[], [result]),
  );

  const displayRewardAsset = useMemo(() => {
    if (result === null || !activeChain) {
      return null;
    }

    const substrateNativeBalance = get(result, `${ZERO_BIG_INT}`, null);
    const hasSubstrateNativeBalance =
      substrateNativeBalance !== null &&
      substrateNativeBalance !== ZERO_BIG_INT;

    const evmNativeBalance = get(result, zeroAddress, null);
    const hasEvmNativeBalance =
      evmNativeBalance !== null && evmNativeBalance !== ZERO_BIG_INT;

    // Return the first non-null balance
    if (!hasEvmNativeBalance && !hasSubstrateNativeBalance) {
      const representativeAsset = Object.entries(result).find(
        ([assetId, balance]) => {
          const hasBalance = balance > ZERO_BIG_INT;
          const hasMetadata = assetsMetadata.get(assetId as RestakeAssetId);

          return hasBalance && hasMetadata;
        },
      );

      if (representativeAsset === undefined) {
        return null;
      }

      const [assetId, balance] = representativeAsset;
      const metadata = assetsMetadata.get(assetId as RestakeAssetId);

      if (!metadata) {
        return null;
      }

      return `${formatUnits(balance, metadata.decimals)} ${metadata.symbol}`;
    }

    const totalBalance =
      (substrateNativeBalance ?? ZERO_BIG_INT) +
      (evmNativeBalance ?? ZERO_BIG_INT);

    const formattedBalance = formatUnits(
      totalBalance,
      activeChain.nativeCurrency.decimals,
    );

    return `${formattedBalance} ${activeChain.nativeCurrency.symbol}`;
  }, [activeChain, assetsMetadata, result]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <KeyStatsItem
        className="!p-0"
        title="Unclaimed Rewards"
        isLoading={isLoading || isAssetsMetadataLoading}
        error={error ?? assetsMetadataError}
      >
        <div className="flex items-baseline gap-2">
          <Typography
            variant="h4"
            fw="bold"
            className="text-mono-140 dark:text-mono-40"
          >
            {displayRewardAsset ?? EMPTY_VALUE_PLACEHOLDER}
          </Typography>

          {result !== null &&
          Object.keys(result).length > 0 &&
          displayRewardAsset ? (
            <ClaimRewardAction
              claimableAssetIds={Object.keys(result) as RestakeAssetId[]}
            />
          ) : null}
        </div>
      </KeyStatsItem>

      <KeyStatsItem
        className="!p-0"
        title="Earned Points"
        isLoading={false}
        error={null}
      >
        {EMPTY_VALUE_PLACEHOLDER} XP
      </KeyStatsItem>
    </div>
  );
};

export default RewardsAndPoints;
