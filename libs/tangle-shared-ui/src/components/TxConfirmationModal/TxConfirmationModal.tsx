import {
  CheckboxCircleLine,
  CloseCircleLineIcon,
  ExternalLinkLine,
  Spinner,
} from '@tangle-network/icons';
import { BN } from '@polkadot/util';
import useNetworkStore from '../../context/useNetworkStore';
import useTxHistoryStore, {
  type HistoryTx,
  type HistoryTxDetail,
} from '../../context/useTxHistoryStore';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import useEvmAddress from '../../hooks/useEvmAddress';
import { useEvmAssetMetadatas } from '../../hooks/useEvmAssetMetadatas';
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
import {
  Modal,
  ModalContent,
  ModalHeader,
} from '@tangle-network/ui-components/components/Modal';
import { formatDistanceToNow } from 'date-fns';
import { capitalize } from 'lodash';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  /**
   * If true, auto-opens when a new pending tx is detected for the active account.
   * Defaults to true.
   */
  autoOpen?: boolean;
  /**
   * Auto-close delay (ms) after a tx finalizes successfully.
   * Defaults to 3000.
   */
  autoCloseSuccessMs?: number;
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
  const isAmountKey = /amount|value|stake|deposit|delegation|shares/i.test(label);
  const isSharesKey = /shares/i.test(label);

  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      // For amount keys, format with decimals; otherwise just add commas
      if (isAmountKey) {
        const decimals = tokenMetadata?.decimals ?? 18;
        const formatted = formatDisplayAmount(
          new BN(value),
          decimals,
          AmountFormatStyle.SHORT,
        );
        // Shares don't need a symbol
        if (isSharesKey) {
          return formatted;
        }
        const symbol = tokenMetadata?.symbol ?? nativeTokenSymbol;
        return `${formatted} ${symbol}`;
      }
      return value.toLocaleString();
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
        const formatted = formatDisplayAmount(
          new BN(value),
          decimals,
          AmountFormatStyle.SHORT,
        );
        // Shares don't need a symbol
        if (isSharesKey) {
          return formatted;
        }
        const symbol = tokenMetadata?.symbol ?? nativeTokenSymbol;
        return `${formatted} ${symbol}`;
      }
      return value;
    }

    // BN value - format with decimals
    const decimals = tokenMetadata?.decimals ?? 18;
    const formatted = formatDisplayAmount(
      value,
      decimals,
      AmountFormatStyle.SHORT,
    );
    // Shares don't need a symbol
    if (isSharesKey) {
      return formatted;
    }
    const symbol = tokenMetadata?.symbol ?? nativeTokenSymbol;
    return `${formatted} ${symbol}`;
  }, [value, isAmountKey, isSharesKey, tokenMetadata, nativeTokenSymbol]);

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

const TxConfirmationModal: FC<Props> = ({
  autoOpen = true,
  autoCloseSuccessMs = 3000,
}) => {
  const transactions = useTxHistoryStore((state) => state.transactions);
  const network = useNetworkStore((store) => store.network2);
  const activeAccountAddress = useActiveAccountAddress();
  const activeEvmAddress = useEvmAddress();
  const { isEvm } = useAgnosticAccountInfo();

  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState<string | null>(null);

  // Prevent reopening the modal for the same tx after a user dismisses it.
  const dismissedHashes = useRef<Set<string>>(new Set());

  const relevantTransactions = useMemo(() => {
    const addressForFilter = activeEvmAddress ?? activeAccountAddress;
    if (addressForFilter === null) {
      return null;
    }

    return (
      transactions
        .filter(
          (tx) =>
            tx.network === network.id &&
            (isEvmAddress(addressForFilter) && isEvmAddress(tx.origin)
              ? tx.origin.toLowerCase() === addressForFilter.toLowerCase()
              : tx.origin === addressForFilter),
        )
        // Avoid `Array.prototype.toSorted` for broader runtime compatibility.
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
    );
  }, [activeAccountAddress, activeEvmAddress, network.id, transactions]);

  const tx: HistoryTx | null = useMemo(() => {
    if (relevantTransactions === null || activeHash === null) {
      return null;
    }

    return relevantTransactions.find((t) => t.hash === activeHash) ?? null;
  }, [activeHash, relevantTransactions]);

  const newestPending = useMemo(() => {
    if (relevantTransactions === null) {
      return null;
    }

    return (
      relevantTransactions.find(
        (t) => t.status === 'pending' || t.status === 'inblock',
      ) ?? null
    );
  }, [relevantTransactions]);

  // Auto-open when we see a new pending tx.
  useEffect(() => {
    if (!autoOpen || newestPending === null) {
      return;
    }

    if (dismissedHashes.current.has(newestPending.hash)) {
      return;
    }

    setActiveHash(newestPending.hash);
    setOpen(true);
  }, [autoOpen, newestPending]);

  // Auto-close on success after a short delay.
  useEffect(() => {
    if (!open || tx === null || tx.status !== 'finalized') {
      return;
    }

    const timer = window.setTimeout(() => {
      setOpen(false);
    }, autoCloseSuccessMs);

    return () => window.clearTimeout(timer);
  }, [autoCloseSuccessMs, open, tx]);

  const explorerUrl = useMemo(() => {
    if (tx === null) {
      return null;
    }

    const resolvedIsEvm = activeEvmAddress !== null ? true : isEvm;
    if (resolvedIsEvm === null) {
      return null;
    }

    return network.createExplorerTxUrl?.(resolvedIsEvm, tx.hash) ?? null;
  }, [activeEvmAddress, isEvm, network, tx]);

  const close = () => {
    if (activeHash !== null) {
      dismissedHashes.current.add(activeHash);
    }
    setOpen(false);
  };

  // Extract token address from details to fetch its metadata
  const tokenAddress = useMemo(() => {
    if (tx?.details === undefined) return null;

    // Look for a "Token" key in the details
    const tokenValue = tx.details.get('Token');
    if (typeof tokenValue === 'string' && isEvmAddress(tokenValue)) {
      return tokenValue as EvmAddress;
    }

    return null;
  }, [tx?.details]);

  // Fetch token metadata for proper amount formatting
  const { data: tokenMetadatas } = useEvmAssetMetadatas(
    tokenAddress ? [tokenAddress] : null,
  );

  const tokenMetadata = useMemo(() => {
    if (!tokenMetadatas || tokenMetadatas.length === 0) return null;
    return tokenMetadatas[0];
  }, [tokenMetadatas]);

  if (tx === null) {
    return null;
  }

  const StatusIcon = (() => {
    if (tx.status === 'finalized') return CheckboxCircleLine;
    if (tx.status === 'failed') return CloseCircleLineIcon;
    return Spinner;
  })();

  const statusColorClass =
    tx.status === 'finalized'
      ? 'text-green-60'
      : tx.status === 'failed'
        ? 'text-red-60'
        : 'text-mono-120';

  const chipColor =
    tx.status === 'finalized'
      ? 'green'
      : tx.status === 'failed'
        ? 'red'
        : 'blue';

  return (
    <Modal
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
    >
      <ModalContent
        size="md"
        title="Transaction"
        description="Transaction status"
      >
        <ModalHeader onClose={close} titleVariant="h4">
          Transaction
        </ModalHeader>

        <hr className="w-full mt-6 border-b border-mono-40 dark:border-mono-170" />

        <div className="px-8 pt-6 pb-8">
          <div className="p-3 space-y-4 rounded-md bg-mono-20 dark:bg-mono-180">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start gap-2">
                <StatusIcon
                  size="md"
                  className={twMerge(
                    'fill-current',
                    statusColorClass,
                    tx.status === 'pending' || tx.status === 'inblock'
                      ? 'animate-spin'
                      : '',
                  )}
                />

                <Typography variant="body1" className="dark:text-mono-0">
                  {capitalize(tx.name.toString())}
                </Typography>

                <Chip className="normal-case cursor-default" color={chipColor}>
                  {tx.status}
                </Chip>
              </div>

              {explorerUrl !== null && (
                <Button
                  variant="link"
                  size="sm"
                  href={explorerUrl.toString()}
                  target="_blank"
                  rel="noopener noreferrer"
                  rightIcon={
                    <ExternalLinkLine className="fill-current dark:fill-current" />
                  }
                >
                  Explorer
                </Button>
              )}
            </div>

            <div className="space-y-1.5">
              <DetailRow label="Transaction" value={tx.hash} showCopyButton />

              {tx.details !== undefined &&
                Array.from(tx.details.entries()).map(([key, value]) => (
                  <DetailRow
                    key={key}
                    label={key === 'Token' ? 'Asset Address' : key}
                    value={value}
                    tokenMetadata={tokenMetadata}
                  />
                ))}
            </div>

            {tx.status === 'failed' && tx.errorMessage && (
              <Alert type="error" size="sm" description={tx.errorMessage} />
            )}

            <hr className="dark:border-mono-160" />

            <Typography className="text-center" variant="body3">
              {tx.status} &bull;{' '}
              {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
            </Typography>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="secondary" size="sm" onClick={close}>
              Close
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default TxConfirmationModal;
