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
import {
  Alert,
  Button,
  Chip,
  CopyWithTooltip,
  isEvmAddress,
  isSubstrateAddress,
  shortenHex,
  shortenString,
  Typography,
} from '@tangle-network/ui-components';
import {
  Modal,
  ModalContent,
  ModalHeader,
} from '@tangle-network/ui-components/components/Modal';
import { formatDistanceToNow } from 'date-fns';
import { capitalize } from 'lodash';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
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

  const formatDetailValue = useCallback((value: HistoryTxDetail) => {
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      if (isEvmAddress(value)) return shortenHex(value);
      if (isSubstrateAddress(value)) return shortenString(value);
      return value;
    }

    if (value instanceof BN) {
      return value.toString();
    }

    return '';
  }, []);

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

            <div className="flex items-center justify-between gap-2">
              <Typography variant="body2" className="font-mono text-mono-140">
                {shortenHex(tx.hash)}
              </Typography>

              <CopyWithTooltip
                textToCopy={tx.hash}
                copyLabel="Copy hash"
                iconClassName="text-mono-140 dark:text-mono-80"
              />
            </div>

            {tx.details && tx.details.size > 0 && (
              <div className="flex flex-wrap gap-1">
                {Array.from(tx.details.entries()).map(([key, value]) => (
                  <Chip
                    className="normal-case cursor-default"
                    key={key}
                    color="blue"
                  >
                    {key}: {formatDetailValue(value)}
                  </Chip>
                ))}
              </div>
            )}

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
