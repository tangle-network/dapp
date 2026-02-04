import { FC, useMemo } from 'react';
import { zeroAddress } from 'viem';
import { SkeletonLoader, Typography } from '@tangle-network/ui-components';
import type { AssetSecurityRequirement } from '@tangle-network/tangle-shared-ui/data/services';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';

type Props = {
  securityRequirements: AssetSecurityRequirement[];
  isLoading: boolean;
};

const formatBps = (bps: number): string => {
  return `${(bps / 100).toFixed(2)}%`;
};

const SecurityRequirementsSection: FC<Props> = ({
  securityRequirements,
  isLoading,
}) => {
  // Extract token addresses for metadata resolution
  const tokenAddresses = useMemo(() => {
    if (securityRequirements.length === 0) {
      return null;
    }
    return securityRequirements.map((req) => {
      // For native token (kind=0), use zero address for metadata lookup
      // For ERC20 (kind=1), use the token address
      const addr = req.asset.kind === 0 ? zeroAddress : req.asset.token;
      return addr as EvmAddress;
    });
  }, [securityRequirements]);

  // Fetch token metadata
  const { data: tokenMetadatas, isLoading: isLoadingMetadata } =
    useEvmAssetMetadatas(tokenAddresses);

  // Get asset label from metadata or fallback
  const getAssetLabel = (index: number): string => {
    const metadata = tokenMetadatas?.[index];
    if (metadata?.symbol) {
      return metadata.symbol;
    }
    // Fallback: check if native (kind=0)
    const req = securityRequirements[index];
    if (req.asset.kind === 0 || req.asset.token === zeroAddress) {
      return 'ETH';
    }
    return `${req.asset.token.slice(0, 6)}...${req.asset.token.slice(-4)}`;
  };

  if (isLoading || isLoadingMetadata) {
    return (
      <div className="space-y-2">
        <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
          Security Requirements
        </Typography>

        <SkeletonLoader className="h-10 w-full" />
      </div>
    );
  }

  if (securityRequirements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
        Security Requirements
      </Typography>

      <div className="space-y-2">
        {securityRequirements.map((req, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-mono-20 dark:bg-mono-180"
          >
            <span className="text-sm font-semibold">
              {getAssetLabel(index)}
            </span>

            <span className="text-sm text-mono-140 dark:text-mono-80">
              {formatBps(req.minExposureBps)} - {formatBps(req.maxExposureBps)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityRequirementsSection;
