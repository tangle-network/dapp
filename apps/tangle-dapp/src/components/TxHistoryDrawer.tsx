import { BN } from '@polkadot/util';
import * as Dialog from '@radix-ui/react-dialog';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import {
  CheckboxCircleLine,
  CloseCircleLineIcon,
  InformationLine,
  ShuffleLine,
  Spinner,
} from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import {
  Alert,
  AmountFormatStyle,
  Button,
  Chip,
  formatDisplayAmount,
  isEvmAddress,
  isSubstrateAddress,
  shortenHex,
  shortenString,
  Typography,
} from '@tangle-network/ui-components';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import { formatDistanceToNow } from 'date-fns';
import { capitalize } from 'lodash';
import { useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import useTxHistoryStore, {
  HistoryTx,
} from '@tangle-network/tangle-shared-ui/context/useTxHistoryStore';
import ExternalLink from './ExternalLink';

const TxHistoryDrawer = () => {
  const activeAccountAddress = useActiveAccountAddress();
  const transactions = useTxHistoryStore((state) => state.transactions);
  const networkId = useNetworkStore((store) => store.network2?.id);

  const relevantTransactions = useMemo(() => {
    if (networkId === undefined || activeAccountAddress === null) {
      return null;
    }

    return (
      transactions
        .filter(
          (tx) =>
            tx.network === networkId && tx.origin === activeAccountAddress,
        )
        // Sort by timestamp in descending order.
        .toSorted((a, b) => b.timestamp - a.timestamp)
    );
  }, [activeAccountAddress, networkId, transactions]);

  const inProgressCount = useMemo(() => {
    if (relevantTransactions === null) {
      return null;
    }

    const count = relevantTransactions.filter(
      (tx) => tx.status === 'pending' || tx.status === 'inblock',
    ).length;

    return count === 0 ? null : count;
  }, [relevantTransactions]);

  // Hide the button if there are no known transactions.
  if (
    relevantTransactions?.length === undefined ||
    relevantTransactions.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex items-center">
      <Dialog.Root>
        <Dialog.Trigger className="outline-none">
          <Button
            variant="secondary"
            className={twMerge(
              'rounded-full border-2 py-2 px-4',
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

                <CloseCircleLineIcon />
              </div>

              {relevantTransactions !== null &&
                relevantTransactions.map((tx) => (
                  <TransactionItem key={tx.hash} {...tx} />
                ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
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
  const { isEvm } = useAgnosticAccountInfo();

  // TODO: Open account details on explorer.
  const createExplorerAccountUrl = useNetworkStore(
    (store) => store.network2?.createExplorerAccountUrl,
  );

  const createExplorerTxUrl = useNetworkStore(
    (store) => store.network2?.createExplorerTxUrl,
  );

  const formatDetailValue = useCallback(
    (value: string | number | SubstrateAddress | EvmAddress | BN) => {
      if (typeof value === 'number') {
        return addCommasToNumber(value);
      } else if (typeof value === 'string' && isEvmAddress(value)) {
        return shortenHex(value);
      } else if (typeof value === 'string' && isSubstrateAddress(value)) {
        return shortenString(value);
      } else if (typeof value === 'string') {
        return value;
      }

      return formatDisplayAmount(
        value,
        TANGLE_TOKEN_DECIMALS,
        AmountFormatStyle.SHORT,
      );
    },
    [],
  );

  const explorerLink = useMemo(() => {
    if (createExplorerTxUrl === undefined || isEvm === null) {
      return null;
    }

    return createExplorerTxUrl(isEvm, hash);
  }, [createExplorerTxUrl, hash, isEvm]);

  return (
    <div className="p-3 space-y-4 rounded-md bg-mono-20 dark:bg-mono-180">
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

        <ExternalLink href={explorerLink ?? '#'}>Explorer</ExternalLink>
      </div>

      <div className="flex flex-wrap gap-1">
        {details === undefined
          ? 'No details.'
          : Array.from(details.entries()).map(([key, value]) => (
              <Chip
                className="normal-case cursor-default"
                key={key}
                color="blue"
              >
                {key}: {formatDetailValue(value)}
              </Chip>
            ))}
      </div>

      {status === 'failed' && errorMessage !== undefined && (
        <Alert type="error" size="sm" description={errorMessage} />
      )}

      <hr className="dark:border-mono-160" />

      <Typography className="text-center" variant="body3">
        {status} &bull;{' '}
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </Typography>
    </div>
  );
};

export default TxHistoryDrawer;
