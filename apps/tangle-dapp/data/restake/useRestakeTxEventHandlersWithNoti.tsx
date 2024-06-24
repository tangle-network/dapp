import { useWebContext } from '@webb-tools/api-provider-environment';
import Spinner from '@webb-tools/icons/Spinner';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useMemo } from 'react';

import useExplorerUrl from '../../hooks/useExplorerUrl';
import { TxEvent, type TxEventHandlers } from './RestakeTx/base';

export default function useRestakeTxEventHandlersWithNoti(
  props?: TxEventHandlers,
) {
  const { activeChain } = useWebContext();
  const { notificationApi } = useWebbUI();
  const getExplorerUrl = useExplorerUrl();

  const blockExplorer = useMemo(
    () => activeChain?.blockExplorers?.default.url,
    [activeChain?.blockExplorers?.default.url],
  );

  return useMemo<TxEventHandlers>(
    () => ({
      onTxSending: () => {
        notificationApi.addToQueue({
          key: TxEvent.SENDING,
          Icon: <Spinner size="lg" />,
          message: 'Sending transaction...',
          variant: 'info',
          persist: true,
        });
        props?.onTxSending?.();
      },
      onTxInBlock: (txHash) => {
        const url = getExplorerUrl(txHash, 'tx', undefined, blockExplorer);

        notificationApi.remove(TxEvent.SENDING);
        notificationApi.addToQueue({
          key: TxEvent.IN_BLOCK,
          Icon: <Spinner size="lg" />,
          message: 'Transaction is included in a block',
          secondaryMessage: <ViewTxOnExplorer url={url?.toString()} />,
          variant: 'info',
          persist: true,
        });

        props?.onTxInBlock?.(txHash);
      },
      onTxSuccess: (txHash) => {
        const url = getExplorerUrl(txHash, 'tx', undefined, blockExplorer);

        notificationApi.remove(TxEvent.SENDING);
        notificationApi.remove(TxEvent.IN_BLOCK);
        notificationApi.remove(TxEvent.FINALIZED);

        notificationApi.addToQueue({
          key: TxEvent.SUCCESS,
          message: 'Transaction finalized successfully!',
          secondaryMessage: <ViewTxOnExplorer url={url?.toString()} />,
          variant: 'success',
        });

        props?.onTxSuccess?.(txHash);
      },
      onTxFailed: (error) => {
        notificationApi.remove(TxEvent.SENDING);
        notificationApi.remove(TxEvent.IN_BLOCK);
        notificationApi.remove(TxEvent.FINALIZED);

        notificationApi.addToQueue({
          key: TxEvent.FAILED,
          message: 'Transaction failed!',
          secondaryMessage: (
            <Typography
              variant="body1"
              className="text-red-70 dark:text-red-50"
            >
              {error}
            </Typography>
          ),
          variant: 'error',
        });

        props?.onTxFailed?.(error);
      },
    }),
    [blockExplorer, getExplorerUrl, notificationApi, props],
  );
}

/**
 * @internal
 */
function ViewTxOnExplorer({ url }: { url?: string } = {}) {
  if (url === undefined) return null;

  return (
    <Typography variant="body1">
      View the transaction{' '}
      <Button
        className="inline-block"
        variant="link"
        href={url?.toString()}
        target="_blank"
      >
        on the explorer
      </Button>
    </Typography>
  );
}
