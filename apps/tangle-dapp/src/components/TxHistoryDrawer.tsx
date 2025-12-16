import { BN } from '@polkadot/util';
import * as Dialog from '@radix-ui/react-dialog';
import {
  CheckboxCircleLine,
  CloseCircleLineIcon,
  InformationLine,
  ShuffleLine,
  Spinner,
} from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  Alert,
  AmountFormatStyle,
  Button,
  Chip,
  CopyWithTooltip,
  formatDisplayAmount,
  isEvmAddress,
  isSubstrateAddress,
  shortenHex,
  shortenString,
  Typography,
} from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import { formatDistanceToNow } from 'date-fns';
import { capitalize } from 'lodash';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import useTxHistoryStore, {
  HistoryTx,
  HistoryTxDetail,
} from '@tangle-network/tangle-shared-ui/context/useTxHistoryStore';
import useEvmAddress from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import ExternalLink from './ExternalLink';

const TxHistoryDrawer = () => {
  const activeEvmAddress = useEvmAddress();
  const transactions = useTxHistoryStore((state) => state.transactions);
  const networkId = useNetworkStore((store) => store.network2?.id);

  const relevantTransactions = useMemo(() => {
    if (networkId === undefined || activeEvmAddress === null) {
      return null;
    }

    return (
      transactions
        .filter(
          (tx) =>
            tx.network === networkId &&
            (isEvmAddress(activeEvmAddress) && isEvmAddress(tx.origin)
              ? tx.origin.toLowerCase() === activeEvmAddress.toLowerCase()
              : tx.origin === activeEvmAddress),
        )
        // Sort by timestamp in descending order.
        // Avoid `Array.prototype.toSorted` for broader runtime compatibility.
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
    );
  }, [activeEvmAddress, networkId, transactions]);

  const inProgressCount = useMemo(() => {
    if (relevantTransactions === null) {
      return null;
    }

    const count = relevantTransactions.filter(
      (tx) => tx.status === 'pending' || tx.status === 'inblock',
    ).length;

    return count === 0 ? null : count;
  }, [relevantTransactions]);

  return (
    <div className="flex items-center">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button
            variant="secondary"
            className={twMerge(
              'outline-none rounded-full border-2 py-2 px-4',
              'bg-mono-0/10 border-mono-60 dark:border-mono-140',
              'dark:bg-mono-0/5 dark:border-mono-140',
              'hover:bg-mono-100/10 dark:hover:bg-mono-0/10',
              'hover:border-mono-60 dark:hover:border-mono-140',
            )}
          >
            <div className="flex items-center gap-1">
              <ShuffleLine className="fill-mono-160 dark:fill-mono-0" />

              <Typography
                variant="body1"
                fw="semibold"
                className="text-mono-160 dark:text-mono-0"
              >
                Transactions{' '}
                {inProgressCount !== null && (
                  <Chip color="yellow">
                    {addCommasToNumber(inProgressCount)}
                  </Chip>
                )}
              </Typography>
            </div>
          </Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay
            forceMount
            className={twMerge(
              'fixed inset-0 z-20 bg-black/65 backdrop-blur-[1px]',
              'animate-in duration-200 fade-in-0',
              'data-[state=open]:ease-out data-[state=closed]:ease-in',
            )}
          />

          <Dialog.Content
            forceMount
            className={twMerge(
              'w-[400px] h-[calc(100%-16px)] outline-none overflow-auto py-6 px-4 z-50 rounded-xl',
              'bg-mono-0 dark:bg-mono-200 fixed right-2 top-2 bottom-2',
              'flex flex-col gap-6 justify-between',
              'data-[state=open]:animate-in data-[state=open]:ease-out data-[state=open]:duration-200',
              'data-[state=open]:slide-in-from-right-full',
              'data-[state=closed]:animate-out data-[state=closed]:ease-in data-[state=closed]:duration-100',
              'data-[state=closed]:slide-out-to-right-full',
            )}
          >
            <Dialog.Title className="sr-only">Sidebar Menu</Dialog.Title>

            <Dialog.Description className="sr-only">
              Sidebar Menu
            </Dialog.Description>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Typography variant="h5">Transactions</Typography>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close"
                    className="text-mono-160 dark:text-mono-0 p-1 rounded-full hover:bg-mono-40 dark:hover:bg-mono-160 transition-colors"
                  >
                    <CloseCircleLineIcon size="lg" />
                  </button>
                </Dialog.Close>
              </div>

              {relevantTransactions === null ||
              relevantTransactions.length === 0 ? (
                <Typography variant="body2" className="text-mono-140">
                  No transactions yet.
                </Typography>
              ) : (
                relevantTransactions.map((tx) => (
                  <TransactionItem key={tx.hash} {...tx} />
                ))
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

/** @internal */
type TokenMetadata = {
  symbol: string;
  decimals: number;
};

type DetailRowProps = {
  label: string;
  value: HistoryTxDetail;
  showCopyButton?: boolean;
  tokenMetadata?: TokenMetadata | null;
};

// Check if a string is a pure numeric value (all digits)
const isNumericString = (value: string): boolean => {
  return /^\d+$/.test(value);
};

const DetailRow: FC<DetailRowProps> = ({
  label,
  value,
  showCopyButton,
  tokenMetadata,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const isAddress =
    typeof value === 'string' &&
    (isEvmAddress(value) || isSubstrateAddress(value));
  const isAmountKey = /amount|value|stake|deposit|delegation/i.test(label);

  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      // For amount keys, format with decimals; otherwise just add commas
      if (isAmountKey) {
        const decimals = tokenMetadata?.decimals ?? 18;
        const symbol = tokenMetadata?.symbol ?? nativeTokenSymbol;
        const formatted = formatDisplayAmount(
          new BN(value),
          decimals,
          AmountFormatStyle.SHORT,
        );
        return `${formatted} ${symbol}`;
      }
      return addCommasToNumber(value);
    }

    if (typeof value === 'string' && isEvmAddress(value)) {
      return shortenHex(value);
    }

    if (typeof value === 'string' && isSubstrateAddress(value)) {
      return shortenString(value);
    }

    if (typeof value === 'string') {
      // For amount-related keys with numeric strings, format as token amounts
      if (isAmountKey && isNumericString(value)) {
        const decimals = tokenMetadata?.decimals ?? 18;
        const symbol = tokenMetadata?.symbol ?? nativeTokenSymbol;
        const formatted = formatDisplayAmount(
          new BN(value),
          decimals,
          AmountFormatStyle.SHORT,
        );
        return `${formatted} ${symbol}`;
      }
      return value;
    }

    // BN value - format with decimals
    const decimals = tokenMetadata?.decimals ?? 18;
    const symbol = tokenMetadata?.symbol ?? nativeTokenSymbol;
    const formatted = formatDisplayAmount(value, decimals, AmountFormatStyle.SHORT);
    return `${formatted} ${symbol}`;
  }, [value, isAmountKey, tokenMetadata, nativeTokenSymbol]);

  const rawValue = useMemo(() => {
    if (BN.isBN(value)) {
      return value.toString();
    }

    return typeof value === 'string' ? value : String(value);
  }, [value]);

  const shouldShowCopy = showCopyButton ?? isAddress;

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-mono-120 dark:text-mono-100 text-[13px]">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className={twMerge(
            'text-mono-200 dark:text-mono-0 text-[13px]',
            isAddress && 'font-mono',
          )}
        >
          {formattedValue}
        </span>
        {shouldShowCopy && (
          <CopyWithTooltip
            textToCopy={rawValue}
            copyLabel={`Copy ${label.toLowerCase()}`}
            iconClassName="text-mono-100 dark:text-mono-80 !w-2 !h-2"
            isButton={false}
          />
        )}
      </div>
    </div>
  );
};

/** @internal */
const TransactionItem = ({
  hash,
  name,
  timestamp,
  status,
  details,
  errorMessage,
}: HistoryTx) => {
  const createExplorerTxUrl = useNetworkStore(
    (store) => store.network2?.createExplorerTxUrl,
  );

  // Extract token address from details to fetch its metadata
  const tokenAddress = useMemo(() => {
    if (details === undefined) return null;

    // Look for a "Token" key in the details
    const tokenValue = details.get('Token');
    if (typeof tokenValue === 'string' && isEvmAddress(tokenValue)) {
      return tokenValue as EvmAddress;
    }

    return null;
  }, [details]);

  // Fetch token metadata for proper amount formatting
  const { data: tokenMetadatas } = useEvmAssetMetadatas(
    tokenAddress ? [tokenAddress] : null,
  );

  const tokenMetadata = useMemo(() => {
    if (!tokenMetadatas || tokenMetadatas.length === 0) return null;
    return tokenMetadatas[0];
  }, [tokenMetadatas]);

  const explorerLink = useMemo(() => {
    if (createExplorerTxUrl === undefined) {
      return null;
    }

    // `tangle-dapp` is EVM-only.
    return createExplorerTxUrl(true, hash);
  }, [createExplorerTxUrl, hash]);

  return (
    <div className="p-3 space-y-3 rounded-md bg-mono-20 dark:bg-mono-180">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          {status === 'finalized' ? (
            <CheckboxCircleLine className="fill-green-50 dark:fill-green-50" />
          ) : status === 'failed' ? (
            <InformationLine
              size="md"
              className="fill-red-70 dark:fill-red-50"
            />
          ) : (
            <Spinner />
          )}

          <Typography variant="body1" className="dark:text-mono-0">
            {capitalize(name)}
          </Typography>
        </div>

        {explorerLink !== null && (
          <ExternalLink href={explorerLink}>Explorer</ExternalLink>
        )}
      </div>

      <div className="space-y-1.5">
        <DetailRow label="Transaction" value={hash} showCopyButton />

        {details !== undefined &&
          Array.from(details.entries()).map(([key, value]) => (
            <DetailRow
              key={key}
              label={key}
              value={value}
              tokenMetadata={tokenMetadata}
            />
          ))}
      </div>

      {status === 'failed' && errorMessage !== undefined && (
        <Alert type="error" size="sm" description={errorMessage} />
      )}

      <hr className="dark:border-mono-160" />

      <Typography className="text-center text-mono-120" variant="body3">
        {status} &bull;{' '}
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </Typography>
    </div>
  );
};

export default TxHistoryDrawer;
