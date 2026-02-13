import { FC, Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router';
import { useChainId } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import {
  Avatar,
  Button,
  Card,
  CardVariant,
  CopyWithTooltip,
  Pagination,
  Typography,
} from '@tangle-network/ui-components';
import { ExternalLinkLine, TokenIcon } from '@tangle-network/icons';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import { type DeveloperPaymentEvent } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useTokenMetadata } from '@tangle-network/tangle-shared-ui/data/services';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import { PagePath } from '../../../types';
import { getActiveChainConfig } from '../../../utils/explorer';
import { resolveTokenIconSymbol } from '../../../utils/tokenPresentation';
import { formatEarningsAmount } from '@tangle-network/tangle-shared-ui/data/graphql';

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
          <Avatar size="sm" value={token} theme="ethereum" />
        )}
      </div>
      <Typography variant="body2">
        {formatEarningsAmount(amount, decimals)} {symbol}
      </Typography>
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
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Developer Payout Events
      </Typography>

      {events.length === 0 ? (
        <div className="text-center py-6">
          <Typography variant="body1" className="text-mono-100">
            No developer payout events found for this wallet context.
          </Typography>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <Link to={PagePath.BLUEPRINTS}>
              <Button variant="secondary" size="sm">
                View Blueprints
              </Button>
            </Link>
            {walletActivityUrl && (
              <a href={walletActivityUrl} target="_blank" rel="noreferrer">
                <Button size="sm">View Wallet Activity</Button>
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mono-60 dark:border-mono-140">
                <th className="text-left py-3 px-4 text-mono-100 font-medium">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-mono-100 font-medium">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-mono-100 font-medium">
                  Blueprint
                </th>
                <th className="text-left py-3 px-4 text-mono-100 font-medium">
                  Service
                </th>
                <th className="text-left py-3 px-4 text-mono-100 font-medium">
                  Tx Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleEvents.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-mono-40 dark:border-mono-160"
                >
                  <td className="py-3 px-4">
                    <Typography variant="body2">
                      {new Date(Number(entry.paidAt) * 1000).toLocaleString()}
                    </Typography>
                  </td>
                  <td className="py-3 px-4">
                    <PayoutEventAmountCell
                      token={entry.token}
                      amount={entry.amount}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={PagePath.BLUEPRINTS_DETAILS.replace(
                        ':id',
                        entry.blueprintId.toString(),
                      )}
                      className="underline body2"
                    >
                      #{entry.blueprintId.toString()}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={PagePath.SERVICE_DETAILS.replace(
                        ':id',
                        entry.serviceId.toString(),
                      )}
                      className="underline body2"
                    >
                      #{entry.serviceId.toString()}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-mono-100">
                      <Typography
                        variant="body2"
                        className="font-mono text-mono-100"
                      >
                        {shortenHex(entry.txHash, 6)}
                      </Typography>
                      <CopyWithTooltip
                        textToCopy={entry.txHash}
                        copyLabel="Copy tx hash"
                        isButton={false}
                        className="inline-flex text-mono-100"
                        iconClassName="!fill-mono-100"
                      />
                      {showExplorerActions && txExplorerUrl && (
                        <a
                          href={`${txExplorerUrl}/tx/${entry.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-mono-100"
                          aria-label="View transaction on block explorer"
                        >
                          <ExternalLinkLine className="w-4 h-4 !fill-mono-100" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalEventPages > 1 && (
            <Pagination
              className="mt-2"
              title="events"
              itemsPerPage={pageSize}
              totalItems={events.length}
              totalPages={totalEventPages}
              page={eventsPageIndex + 1}
              canPreviousPage={eventsPageIndex > 0}
              previousPage={() => {
                setEventsPageIndex((current) => Math.max(current - 1, 0));
              }}
              canNextPage={eventsPageIndex < totalEventPages - 1}
              nextPage={() => {
                setEventsPageIndex((current) =>
                  Math.min(current + 1, totalEventPages - 1),
                );
              }}
              setPageIndex={(updater) => {
                setEventsPageIndex((current) => {
                  const next =
                    typeof updater === 'function' ? updater(current) : updater;
                  return Math.min(Math.max(next, 0), totalEventPages - 1);
                });
              }}
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default PayoutEventsCard;
