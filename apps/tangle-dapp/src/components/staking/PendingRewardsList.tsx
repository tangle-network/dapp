/**
 * Shared component for displaying pending rewards per asset.
 * Used in both ClaimRewardsDropdown and ClaimableRewardsCard side panel.
 */

import { FC, useMemo } from 'react';
import { Address, formatUnits } from 'viem';
import { useChainId } from 'wagmi';
import { TokenIcon } from '@tangle-network/icons';
import { Avatar, Typography } from '@tangle-network/ui-components';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import type { VaultPendingRewards } from '../../data/rewards/usePendingRewards';

const isFallbackSymbol = (symbol: string) =>
  symbol.startsWith('0x') || symbol.includes('...');

const resolveTokenIconSymbol = (
  chainId: number,
  symbol: string,
  address: Address,
) => {
  const cached = getCachedTokenMetadata(chainId, address);
  const candidate = cached?.symbol ?? symbol;
  return isFallbackSymbol(candidate) ? null : candidate;
};

interface PendingRewardsListProps {
  vaults: VaultPendingRewards[];
  className?: string;
}

const PendingRewardsList: FC<PendingRewardsListProps> = ({
  vaults,
  className,
}) => {
  const chainId = useChainId();

  const vaultAddresses = useMemo(() => {
    return vaults.map((v) => v.asset as EvmAddress);
  }, [vaults]);

  const { data: tokenMetadatas } = useEvmAssetMetadatas(vaultAddresses);

  return (
    <div className={className}>
      {vaults.map((vault) => {
        const metadata = tokenMetadatas?.find(
          (m) => m.id.toLowerCase() === vault.asset.toLowerCase(),
        );
        const symbol =
          metadata?.symbol ??
          `${vault.asset.slice(0, 6)}...${vault.asset.slice(-4)}`;
        const iconSymbol = resolveTokenIconSymbol(chainId, symbol, vault.asset);

        return (
          <div
            key={vault.asset}
            className="flex items-center justify-between py-2 gap-6"
          >
            <div className="flex items-center gap-2">
              {iconSymbol ? (
                <TokenIcon name={iconSymbol} size="lg" />
              ) : (
                <Avatar size="md" value={vault.asset} theme="ethereum" />
              )}

              <div className="flex flex-col">
                <Typography
                  variant="body2"
                  className="text-mono-200 dark:text-mono-0"
                >
                  {symbol}
                </Typography>

                <Typography
                  variant="body3"
                  className="text-mono-100 dark:text-mono-120 font-mono"
                  title={vault.asset}
                >
                  {vault.asset.slice(0, 6)}...{vault.asset.slice(-4)}
                </Typography>
              </div>
            </div>

            <Typography
              variant="body2"
              className="text-mono-200 dark:text-mono-0"
            >
              {parseFloat(formatUnits(vault.totalPending, 18)).toFixed(4)} TNT
            </Typography>
          </div>
        );
      })}
    </div>
  );
};

export default PendingRewardsList;
