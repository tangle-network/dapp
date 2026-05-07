import * as Dialog from '@radix-ui/react-dialog';
import {
  CheckboxCircleLine,
  CloseCircleLineIcon,
  ExternalLinkLine,
  InformationLine,
  ShuffleLine,
  Spinner,
} from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useTxHistoryStore, {
  type HistoryTx,
  type HistoryTxDetail,
} from '@tangle-network/tangle-shared-ui/context/useTxHistoryStore';
import useEvmAddress from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import { Alert, Button, Chip, Text } from './sandbox/SandboxUi';
import { EmptyState } from '@tangle-network/sandbox-ui/primitives';
import { formatDistanceToNow } from 'date-fns';
import { capitalize } from 'lodash';
import { type FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

const addCommasToNumber = (value: number) => value.toLocaleString();
const isEvmAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);
const isSubstrateAddress = (value: string) =>
  value.length >= 47 && value.length <= 50 && !value.startsWith('0x');
const shortenHex = (value: string) =>
  value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
const shortenString = (value: string) =>
  value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
const formatDisplayAmount = (value: bigint, decimals: number) => {
  const raw = value.toString();
  if (decimals <= 0) return addCommasToNumber(Number(raw));
  const padded = raw.padStart(decimals + 1, '0');
  const whole = padded.slice(0, -decimals);
  const fraction = padded.slice(-decimals).replace(/0+$/, '').slice(0, 4);
  return `${addCommasToNumber(Number(whole))}${fraction ? `.${fraction}` : ''}`;
};

const CopyValueButton: FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <button
    type="button"
    className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    onClick={() => void navigator.clipboard?.writeText(value)}
  >
    Copy {label}
  </button>
);

const TxHistoryDrawer: FC = () => {
  const activeEvmAddress = useEvmAddress();
  const transactions = useTxHistoryStore((state) => state.transactions);
  const networkId = useNetworkStore((store) => store.network2?.id);

  const relevantTransactions = useMemo(() => {
    if (networkId === undefined || activeEvmAddress === null) {
      return null;
    }

    return transactions
      .filter(
        (tx) =>
          tx.network === networkId &&
          (isEvmAddress(activeEvmAddress) && isEvmAddress(tx.origin)
            ? tx.origin.toLowerCase() === activeEvmAddress.toLowerCase()
            : tx.origin === activeEvmAddress),
      )
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp);
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
            variant="outline"
            aria-label="Transactions"
            title="Transactions"
            className={twMerge(
              'h-11 gap-2 border-border bg-muted/30 px-3 font-bold text-foreground hover:bg-muted',
            )}
          >
            <ShuffleLine className="fill-current" />
            <span className="sr-only">Transactions</span>
            {inProgressCount !== null && (
              <Chip color="yellow">{addCommasToNumber(inProgressCount)}</Chip>
            )}
          </Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay
            forceMount
            className={twMerge(
              'fixed inset-0 z-[70] bg-black/65 backdrop-blur-[1px]',
              'animate-in duration-200 fade-in-0',
              'data-[state=open]:ease-out data-[state=closed]:ease-in',
            )}
          />

          <Dialog.Content
            forceMount
            className={twMerge(
              'w-[400px] h-[calc(100%-16px)] outline-none overflow-auto py-6 px-4 z-[80] rounded-xl',
              'bg-card text-card-foreground border border-border fixed right-2 top-2 bottom-2',
              'flex flex-col gap-6 justify-between',
              'data-[state=open]:animate-in data-[state=open]:ease-out data-[state=open]:duration-200',
              'data-[state=open]:slide-in-from-right-full',
              'data-[state=closed]:animate-out data-[state=closed]:ease-in data-[state=closed]:duration-100',
              'data-[state=closed]:slide-out-to-right-full',
            )}
          >
            <Dialog.Title className="sr-only">Transactions</Dialog.Title>
            <Dialog.Description className="sr-only">
              Recent transaction timeline
            </Dialog.Description>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text variant="h5">Transactions</Text>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close"
                    className="text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    <CloseCircleLineIcon size="lg" />
                  </button>
                </Dialog.Close>
              </div>

              {relevantTransactions === null ||
              relevantTransactions.length === 0 ? (
                <EmptyState
                  title="No transactions yet"
                  description="Submitted transactions will appear in this drawer."
                />
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
  const isAmountKey = /amount|value|stake|deposit|delegation|shares/i.test(
    label,
  );
  const isSharesKey = /shares/i.test(label);

  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      if (isAmountKey) {
        const decimals = tokenMetadata?.decimals ?? 18;
        const formatted = formatDisplayAmount(BigInt(value), decimals);
        if (isSharesKey) {
          return formatted;
        }
        const symbol = tokenMetadata?.symbol ?? nativeTokenSymbol;
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
      if (isAmountKey && isNumericString(value)) {
        const decimals = tokenMetadata?.decimals ?? 18;
        const formatted = formatDisplayAmount(BigInt(value), decimals);
        if (isSharesKey) {
          return formatted;
        }
        const symbol = tokenMetadata?.symbol ?? nativeTokenSymbol;
        return `${formatted} ${symbol}`;
      }
      return value;
    }

    const decimals = tokenMetadata?.decimals ?? 18;
    const formatted = formatDisplayAmount(value, decimals);
    if (isSharesKey) {
      return formatted;
    }
    const symbol = tokenMetadata?.symbol ?? nativeTokenSymbol;
    return `${formatted} ${symbol}`;
  }, [value, isAmountKey, isSharesKey, tokenMetadata, nativeTokenSymbol]);

  const rawValue = useMemo(() => {
    if (typeof value === 'bigint') {
      return value.toString();
    }

    return typeof value === 'string' ? value : String(value);
  }, [value]);

  const shouldShowCopy = showCopyButton ?? isAddress;

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-[13px]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span
          className={twMerge(
            'text-foreground text-[13px]',
            isAddress && 'font-mono',
          )}
        >
          {formattedValue}
        </span>
        {shouldShowCopy && (
          <CopyValueButton value={rawValue} label={label.toLowerCase()} />
        )}
      </div>
    </div>
  );
};

const TransactionItem: FC<HistoryTx> = ({
  hash,
  name,
  timestamp,
  status,
  details,
  errorMessage,
}) => {
  const createExplorerTxUrl = useNetworkStore(
    (store) => store.network2?.createExplorerTxUrl,
  );

  const tokenAddress = useMemo(() => {
    if (details === undefined) return null;

    const tokenValue = details.get('Token');
    if (typeof tokenValue === 'string' && isEvmAddress(tokenValue)) {
      return tokenValue as `0x${string}`;
    }

    return null;
  }, [details]);

  const { data: tokenMetadatas } = useEvmAssetMetadatas(
    tokenAddress ? ([tokenAddress] as any) : null,
  );

  const tokenMetadata = useMemo(() => {
    if (!tokenMetadatas || tokenMetadatas.length === 0) return null;
    return tokenMetadatas[0];
  }, [tokenMetadatas]);

  const explorerLink = useMemo(() => {
    if (createExplorerTxUrl === undefined) {
      return null;
    }

    return createExplorerTxUrl(true, hash);
  }, [createExplorerTxUrl, hash]);

  return (
    <div className="p-3 space-y-3 rounded-md bg-muted/40">
      <div className="flex items-center justify-between gap-2">
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

          <Text variant="body1">{capitalize(name)}</Text>
        </div>

        {explorerLink !== null && (
          <Button
            variant="link"
            size="sm"
            onClick={() => window.open(explorerLink.toString(), '_blank')}
          >
            Explorer
            <ExternalLinkLine className="fill-current dark:fill-current" />
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <DetailRow label="Transaction" value={hash} showCopyButton />

        {details !== undefined &&
          Array.from(details.entries()).map(([key, value]) => (
            <DetailRow
              key={key}
              label={key === 'Token' ? 'Asset Address' : key}
              value={value}
              tokenMetadata={tokenMetadata}
            />
          ))}
      </div>

      {status === 'failed' && errorMessage !== undefined && (
        <Alert type="error" description={errorMessage} />
      )}

      <hr className="border-border" />

      <Text className="text-center text-muted-foreground" variant="body3">
        {status} &bull;{' '}
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </Text>
    </div>
  );
};

export default TxHistoryDrawer;
