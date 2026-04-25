import { FC, Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router';
import { useChainId } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import {
  Button,
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
import { type DeveloperPaymentEvent } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useTokenMetadata } from '@tangle-network/tangle-shared-ui/data/services';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import { PagePath } from '../../../types';
import { getActiveChainConfig } from '../../../utils/explorer';
import { resolveTokenIconSymbol } from '../../../utils/tokenPresentation';
import { formatEarningsAmount } from '@tangle-network/tangle-shared-ui/data/graphql';

const shortenHex = (value: string, chars = 6) =>
  value.length > chars * 2 + 3
    ? `${value.slice(0, chars)}...${value.slice(-chars)}`
    : value;

interface PayoutEventsCardProps {
  events: DeveloperPaymentEvent[];
  visibleEvents: DeveloperPaymentEvent[];
  totalEventPages: number;
  eventsPageIndex: number;
  setEventsPageIndex: Dispatch<SetStateAction<number>>;
  txExplorerUrl?: string;
  showExplorerActions: boolean;
  walletActivityUrl: string | null;
  pageSize: number;
}

const PayoutEventAmountCell: FC<{ token: Address; amount: bigint }> = ({
  token,
  amount,
}) => {
  const chainId = useChainId();
  const activeChain = getActiveChainConfig(chainId);
  const cachedMetadata = getCachedTokenMetadata(chainId, token);
  const { data: metadata } = useTokenMetadata(token);
  const decimals =
    metadata?.decimals ??
    cachedMetadata?.decimals ??
    (token === zeroAddress
      ? (activeChain?.nativeCurrency?.decimals ?? 18)
      : 18);
  const symbol =
    metadata?.symbol ??
    cachedMetadata?.symbol ??
    (token === zeroAddress
      ? (activeChain?.nativeCurrency?.symbol ?? 'NATIVE')
      : 'TOKEN');
  const iconSymbol = resolveTokenIconSymbol(chainId, symbol, token);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-5 h-5">
        {iconSymbol ? (
          <TokenIcon name={iconSymbol} size="lg" />
        ) : (
          <span className="grid h-5 w-5 place-items-center rounded border border-border bg-muted font-mono text-[9px] text-foreground">
            {token.slice(2, 4).toUpperCase()}
          </span>
        )}
      </div>
      <span>
        {formatEarningsAmount(amount, decimals)} {symbol}
      </span>
    </div>
  );
};

const PayoutEventsCard: FC<PayoutEventsCardProps> = ({
  events,
  visibleEvents,
  totalEventPages,
  eventsPageIndex,
  setEventsPageIndex,
  txExplorerUrl,
  showExplorerActions,
  walletActivityUrl,
  pageSize,
}) => {
  return (
    <Card variant="sandbox">
      <CardContent className="p-6">
        <h2 className="mb-4 font-display font-bold text-foreground text-xl">
          Developer Payout Events
        </h2>

        {events.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              No developer payout events found for this wallet context.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to={PagePath.BLUEPRINTS}>View Blueprints</Link>
              </Button>
              {walletActivityUrl && (
                <Button size="sm" asChild>
                  <a href={walletActivityUrl} target="_blank" rel="noreferrer">
                    View Wallet Activity
                  </a>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Blueprint</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Tx Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleEvents.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(Number(entry.paidAt) * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <PayoutEventAmountCell
                        token={entry.token}
                        amount={entry.amount}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        to={PagePath.BLUEPRINTS_DETAILS.replace(
                          ':id',
                          entry.blueprintId.toString(),
                        )}
                        className="text-primary underline"
                      >
                        #{entry.blueprintId.toString()}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={PagePath.SERVICE_DETAILS.replace(
                          ':id',
                          entry.serviceId.toString(),
                        )}
                        className="text-primary underline"
                      >
                        #{entry.serviceId.toString()}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-mono text-xs">
                          {shortenHex(entry.txHash, 6)}
                        </span>
                        <CopyIconButton
                          value={entry.txHash}
                          label="Copy tx hash"
                        />
                        {showExplorerActions && txExplorerUrl && (
                          <a
                            href={`${txExplorerUrl}/tx/${entry.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground transition-colors hover:text-primary"
                            aria-label="View transaction on block explorer"
                          >
                            <ExternalLinkLine className="h-4 w-4 fill-current" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalEventPages > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3 border-border border-t pt-4 text-muted-foreground text-sm">
                <span>
                  Showing {eventsPageIndex * pageSize + 1}-
                  {Math.min((eventsPageIndex + 1) * pageSize, events.length)} of{' '}
                  {events.length} events
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={eventsPageIndex === 0}
                    onClick={() => {
                      setEventsPageIndex((current) => Math.max(current - 1, 0));
                    }}
                  >
                    Previous
                  </Button>
                  <span className="font-mono text-xs">
                    {eventsPageIndex + 1}/{totalEventPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={eventsPageIndex >= totalEventPages - 1}
                    onClick={() => {
                      setEventsPageIndex((current) =>
                        Math.min(current + 1, totalEventPages - 1),
                      );
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayoutEventsCard;

const CopyIconButton: FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <button
    type="button"
    aria-label={label}
    className="inline-flex text-muted-foreground transition-colors hover:text-primary"
    onClick={() => void navigator.clipboard?.writeText(value)}
  >
    <FileCopyLine className="h-4 w-4 fill-current" />
  </button>
);
