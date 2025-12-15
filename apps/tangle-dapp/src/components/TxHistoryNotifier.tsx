import { ExternalLinkLine } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useTxHistoryStore, {
  type HistoryTx,
} from '@tangle-network/tangle-shared-ui/context/useTxHistoryStore';
import useEvmAddress from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';
import {
  Button,
  CopyWithTooltip,
  isEvmAddress,
  shortenHex,
  Typography,
} from '@tangle-network/ui-components';
import capitalize from 'lodash/capitalize';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useRef } from 'react';
import { TxName } from '../constants';
import { SUCCESS_MESSAGES } from '../hooks/useTxNotification';

const isTxName = (value: string): value is TxName =>
  (Object.values(TxName) as string[]).includes(value);

const TxHistoryNotifier = () => {
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

  useEffect(() => {
    if (relevantTransactions === null || network === undefined) {
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
          <Typography variant="h5">
            Processing {capitalize(tx.name.toString())}
          </Typography>
          <div className="flex items-center justify-between gap-2">
            <Typography variant="body2">{shortenHex(tx.hash)}</Typography>
            <CopyWithTooltip
              textToCopy={tx.hash}
              copyLabel="Copy hash"
              iconClassName="text-mono-140 dark:text-mono-80"
            />
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
              View Explorer
            </Button>
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
          <Typography variant="h5">
            {title ?? `${capitalize(tx.name.toString())} completed`}
          </Typography>
          <div className="flex items-center justify-between gap-2">
            <Typography variant="body2">{shortenHex(tx.hash)}</Typography>
            <CopyWithTooltip
              textToCopy={tx.hash}
              copyLabel="Copy hash"
              iconClassName="text-mono-140 dark:text-mono-80"
            />
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
              View Explorer
            </Button>
          )}
        </div>,
        { variant: 'success', autoHideDuration: 10_000 },
      );
    };

    const notifyFailed = (tx: HistoryTx) => {
      closeSnackbar(tx.hash);

      enqueueSnackbar(
        <div className="space-y-2">
          <Typography variant="h5">
            {capitalize(tx.name.toString())} failed
          </Typography>
          <Typography variant="body2">{tx.errorMessage ?? 'Unknown error'}</Typography>
          <Typography variant="body2">{shortenHex(tx.hash)}</Typography>
        </div>,
        { variant: 'error', autoHideDuration: null },
      );
    };

    for (const tx of relevantTransactions) {
      const prevStatus = lastNotifiedStatusByHash.current.get(tx.hash);
      if (prevStatus === tx.status) {
        continue;
      }

      // New tx (or first time we see it) should still generate a notification
      // based on its current status.
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
