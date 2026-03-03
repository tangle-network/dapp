import { FC } from 'react';
import { useChainId } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import {
  Avatar,
  Card,
  CardVariant,
  CopyWithTooltip,
  Typography,
} from '@tangle-network/ui-components';
import { ExternalLinkLine, TokenIcon } from '@tangle-network/icons';
import { type DeveloperTokenTotal } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useTokenMetadata } from '@tangle-network/tangle-shared-ui/data/services';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import {
  getActiveChainConfig,
  isNonLocalEvmChain,
} from '../../../utils/explorer';
import { formatEarningsAmount } from '@tangle-network/tangle-shared-ui/data/graphql';
import { resolveTokenIconSymbol } from '../../../utils/tokenPresentation';

interface EarningsAssetsCardProps {
  rows: DeveloperTokenTotal[];
  addressExplorerUrl?: string;
}

const EarningsAssetCell: FC<{
  token: Address;
  addressExplorerUrl?: string;
}> = ({ token, addressExplorerUrl }) => {
  const chainId = useChainId();
  const activeChain = getActiveChainConfig(chainId);
  const cachedMetadata = getCachedTokenMetadata(chainId, token);
  const { data: metadata, isLoading } = useTokenMetadata(token);
  const symbol =
    metadata?.symbol ??
    cachedMetadata?.symbol ??
    (token === zeroAddress
      ? (activeChain?.nativeCurrency?.symbol ?? 'NATIVE')
      : 'TOKEN');
  const tokenName =
    token === zeroAddress
      ? (activeChain?.nativeCurrency?.name ?? null)
      : cachedMetadata &&
          cachedMetadata.symbol.toLowerCase() === symbol.toLowerCase()
        ? cachedMetadata.name
        : null;
  const iconSymbol = resolveTokenIconSymbol(chainId, symbol, token);
  const explorerAddressUrl = addressExplorerUrl
    ? `${addressExplorerUrl}/address/${token}`
    : null;
  const showExplorerAction =
    isNonLocalEvmChain(chainId) && !!explorerAddressUrl;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-9 h-9">
        {iconSymbol ? (
          <TokenIcon name={iconSymbol} size="xl" />
        ) : (
          <Avatar size="lg" value={token} theme="ethereum" />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Typography
            variant="body2"
            fw="semibold"
            className="whitespace-nowrap"
          >
            {isLoading ? 'Loading...' : symbol}
          </Typography>
          {tokenName && (
            <Typography
              variant="body3"
              className="text-mono-120 dark:text-mono-100 truncate"
            >
              {tokenName}
            </Typography>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Typography variant="body2" className="font-mono text-mono-100">
            {shortenHex(token)}
          </Typography>
          <CopyWithTooltip
            textToCopy={token}
            copyLabel="Copy asset address"
            isButton={false}
            className="inline-flex text-mono-120 dark:text-mono-100"
          />
          {showExplorerAction && (
            <a
              href={explorerAddressUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-mono-120 dark:text-mono-100"
              aria-label="View asset address on block explorer"
            >
              <ExternalLinkLine className="w-4 h-4 !fill-current" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const TokenAmount: FC<{
  token: Address;
  amount: bigint;
  className?: string;
}> = ({ token, amount, className }) => {
  const { data: metadata } = useTokenMetadata(token);
  const decimals = metadata?.decimals ?? 18;
  const symbol =
    metadata?.symbol ??
    (token.toLowerCase() === zeroAddress ? 'NATIVE' : 'TOKEN');
  const formattedAmount = formatEarningsAmount(amount, decimals);

  return (
    <Typography variant="body2" className={className}>
      {formattedAmount} {symbol}
    </Typography>
  );
};

const EarningsByAssetsTable: FC<{
  rows: DeveloperTokenTotal[];
  addressExplorerUrl?: string;
}> = ({ rows, addressExplorerUrl }) => {
  if (rows.length === 0) {
    return (
      <Typography variant="body2" className="text-mono-100">
        No payouts recorded.
      </Typography>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-mono-60 dark:border-mono-140">
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Asset
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Amount
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Payout Events
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.token}
              className="border-b border-mono-40 dark:border-mono-160"
            >
              <td className="py-3 px-4">
                <EarningsAssetCell
                  token={row.token}
                  addressExplorerUrl={addressExplorerUrl}
                />
              </td>
              <td className="py-3 px-4">
                <TokenAmount token={row.token} amount={row.totalPaid} />
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2">{row.paymentCount}</Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EarningsAssetsCard: FC<EarningsAssetsCardProps> = ({
  rows,
  addressExplorerUrl,
}) => {
  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Earnings by Assets
      </Typography>
      <EarningsByAssetsTable
        rows={rows}
        addressExplorerUrl={addressExplorerUrl}
      />
    </Card>
  );
};

export default EarningsAssetsCard;
