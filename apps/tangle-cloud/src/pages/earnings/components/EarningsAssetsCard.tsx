import { FC } from 'react';
import { useChainId } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tangle-network/sandbox-ui/primitives';
import {
  ExternalLinkLine,
  FileCopyLine,
  TokenIcon,
} from '@tangle-network/icons';
import { type DeveloperTokenTotal } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useTokenMetadata } from '@tangle-network/tangle-shared-ui/data/services';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import {
  getActiveChainConfig,
  isNonLocalEvmChain,
} from '../../../utils/explorer';
import { formatEarningsAmount } from '@tangle-network/tangle-shared-ui/data/graphql';
import { resolveTokenIconSymbol } from '../../../utils/tokenPresentation';

const shortenHex = (value: string, chars = 6) =>
  value.length > chars * 2 + 3
    ? `${value.slice(0, chars)}...${value.slice(-chars)}`
    : value;

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
          <span className="grid h-9 w-9 place-items-center rounded-md border border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 font-mono text-mono-200 dark:text-mono-0 text-xs">
            {token.slice(2, 4).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="whitespace-nowrap font-semibold text-mono-200 dark:text-mono-0 text-sm">
            {isLoading ? 'Loading...' : symbol}
          </span>
          {tokenName && (
            <span className="truncate text-mono-100 dark:text-mono-60 text-xs">
              {tokenName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-mono-100 dark:text-mono-60 text-xs">
            {shortenHex(token)}
          </span>
          <CopyIconButton value={token} label="Copy asset address" />
          {showExplorerAction && (
            <a
              href={explorerAddressUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-mono-100 dark:text-mono-60 transition-colors hover:text-purple-40"
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
    <span className={className}>
      {formattedAmount} {symbol}
    </span>
  );
};

const EarningsByAssetsTable: FC<{
  rows: DeveloperTokenTotal[];
  addressExplorerUrl?: string;
}> = ({ rows, addressExplorerUrl }) => {
  if (rows.length === 0) {
    return (
      <p className="text-mono-100 dark:text-mono-60 text-sm">
        No payouts recorded.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payout Events</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.token}>
              <TableCell>
                <EarningsAssetCell
                  token={row.token}
                  addressExplorerUrl={addressExplorerUrl}
                />
              </TableCell>
              <TableCell>
                <TokenAmount token={row.token} amount={row.totalPaid} />
              </TableCell>
              <TableCell>{row.paymentCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const EarningsAssetsCard: FC<EarningsAssetsCardProps> = ({
  rows,
  addressExplorerUrl,
}) => {
  return (
    <Card variant="sandbox">
      <CardContent className="p-6">
        <h2 className="mb-4 font-display font-bold text-mono-200 dark:text-mono-0 text-xl">
          Earnings by Assets
        </h2>
        <EarningsByAssetsTable
          rows={rows}
          addressExplorerUrl={addressExplorerUrl}
        />
      </CardContent>
    </Card>
  );
};

export default EarningsAssetsCard;

const CopyIconButton: FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <button
    type="button"
    aria-label={label}
    className="inline-flex text-mono-100 dark:text-mono-60 transition-colors hover:text-purple-40"
    onClick={() => void navigator.clipboard?.writeText(value)}
  >
    <FileCopyLine className="h-4 w-4 fill-current" />
  </button>
);
