import { ExternalLinkLine } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useTxHistoryStore, {
  type HistoryTx,
} from '@tangle-network/tangle-shared-ui/context/useTxHistoryStore';
import useEvmAddress from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';
import { Text } from './sandbox/SandboxUi';
import capitalize from 'lodash/capitalize';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, type FC } from 'react';
import { TxName } from '../constants';
import { SUCCESS_MESSAGES } from '../hooks/useTxNotification';

const isTxName = (value: string): value is TxName =>
  (Object.values(TxName) as string[]).includes(value);

const isEvmAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);
const shortenHex = (value: string) =>
  value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;

const CopyHashButton: FC<{ hash: string }> = ({ hash }) => (
  <button
    type="button"
    className="text-xs text-mono-120 dark:text-mono-100 underline-offset-4 hover:text-mono-200 dark:text-mono-0 hover:underline"
    onClick={() => void navigator.clipboard?.writeText(hash)}
  >
    Copy
  </button>
);

const TxHistoryNotifier: FC = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const activeEvmAddress = useEvmAddress();
  const transactions = useTxHistoryStore((state) => state.transactions);
  const network = useNetworkStore((store) => store.network2);

  const relevantTransactions = useMemo(() => {
    if (activeEvmAddress === null || network === undefined) {
      return null;
    }

    return transactions.filter(
      (tx) =>
        tx.network === network.id &&
        (isEvmAddress(activeEvmAddress) && isEvmAddress(tx.origin)
          ? tx.origin.toLowerCase() === activeEvmAddress.toLowerCase()
          : tx.origin === activeEvmAddress),
    );
  }, [activeEvmAddress, network, transactions]);

  const lastNotifiedStatusByHash = useRef<Map<string, HistoryTx['status']>>(
    new Map(),
  );
  const isInitialized = useRef(false);
  const lastActiveAddress = useRef(activeEvmAddress);

  useEffect(() => {
    if (lastActiveAddress.current !== activeEvmAddress) {
      lastActiveAddress.current = activeEvmAddress;
      lastNotifiedStatusByHash.current.clear();
      isInitialized.current = false;
    }
  }, [activeEvmAddress]);

  useEffect(() => {
    if (relevantTransactions === null || network === undefined) {
      return;
    }

    if (!isInitialized.current) {
      for (const tx of relevantTransactions) {
        lastNotifiedStatusByHash.current.set(tx.hash, tx.status);
      }
      isInitialized.current = true;
      return;
    }

    const createExplorerTxUrl = network.createExplorerTxUrl;

    const notifyPending = (tx: HistoryTx) => {
      const explorerUrl =
        createExplorerTxUrl === undefined
          ? null
          : createExplorerTxUrl(true, tx.hash);

      enqueueSnackbar(
        <div className="space-y-2">
          <Text variant="h5">Processing {capitalize(tx.name.toString())}</Text>
          <div className="flex items-center gap-2">
            <Text variant="body2">{shortenHex(tx.hash)}</Text>
            <CopyHashButton hash={tx.hash} />
          </div>
          {explorerUrl !== null && (
            <a
              href={explorerUrl.toString()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-40 underline-offset-4 hover:underline"
            >
              View Explorer
              <ExternalLinkLine className="fill-current dark:fill-current" />
            </a>
          )}
        </div>,
        { key: tx.hash, variant: 'info', persist: true },
      );
    };

    const notifyFinalized = (tx: HistoryTx) => {
      closeSnackbar(tx.hash);

      const explorerUrl =
        createExplorerTxUrl === undefined
          ? null
          : createExplorerTxUrl(true, tx.hash);

      const title = isTxName(tx.name) ? SUCCESS_MESSAGES[tx.name] : undefined;

      enqueueSnackbar(
        <div className="space-y-2">
          <Text variant="h5">
            {title ?? `${capitalize(tx.name.toString())} completed`}
          </Text>
          <div className="flex items-center gap-2">
            <Text variant="body2">{shortenHex(tx.hash)}</Text>
            <CopyHashButton hash={tx.hash} />
          </div>
          {explorerUrl !== null && (
            <a
              href={explorerUrl.toString()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-40 underline-offset-4 hover:underline"
            >
              View Explorer
              <ExternalLinkLine className="fill-current dark:fill-current" />
            </a>
          )}
        </div>,
        { variant: 'success', autoHideDuration: 10_000 },
      );
    };

    const notifyFailed = (tx: HistoryTx) => {
      closeSnackbar(tx.hash);

      enqueueSnackbar(
        <div className="space-y-2">
          <Text variant="h5">{capitalize(tx.name.toString())} failed</Text>
          <Text variant="body2">{tx.errorMessage ?? 'Unknown error'}</Text>
          <Text variant="body2">{shortenHex(tx.hash)}</Text>
        </div>,
        { variant: 'error', autoHideDuration: null },
      );
    };

    for (const tx of relevantTransactions) {
      const prevStatus = lastNotifiedStatusByHash.current.get(tx.hash);
      if (prevStatus === tx.status) {
        continue;
      }

      if (tx.status === 'pending' || tx.status === 'inblock') {
        notifyPending(tx);
      } else if (tx.status === 'finalized') {
        notifyFinalized(tx);
      } else if (tx.status === 'failed') {
        notifyFailed(tx);
      }

      lastNotifiedStatusByHash.current.set(tx.hash, tx.status);
    }
  }, [closeSnackbar, enqueueSnackbar, network, relevantTransactions]);

  return null;
};

export default TxHistoryNotifier;
