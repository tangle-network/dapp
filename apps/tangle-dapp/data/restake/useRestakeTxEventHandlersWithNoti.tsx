import { isPolkadotJsDashboard } from '@webb-tools/api-provider-environment/transaction/utils';
import type { Evaluate } from '@webb-tools/dapp-types/utils/types';
import Spinner from '@webb-tools/icons/Spinner';
import { type SnackBarOpts } from '@webb-tools/webb-ui-components/components/Notification/NotificationContext';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import type { Hash } from 'viem';

import useNetworkStore from '../../context/useNetworkStore';
import useSubstrateExplorerUrl from '../../hooks/useSubstrateExplorerUrl';
import { TxEvent, type TxEventHandlers } from './RestakeTx/base';
import ViewTxOnExplorer from './ViewTxOnExplorer';

type NotiOpts<Context extends Record<string, unknown>> = Evaluate<
  Partial<
    Omit<SnackBarOpts, 'key' | 'close' | 'secondaryMessage'> & {
      secondaryMessage?:
        | SnackBarOpts['secondaryMessage']
        | ((context: Context, explorerUrl?: string) => React.JSX.Element);
    }
  >
>;

export type Options<Context extends Record<string, unknown>> = Partial<
  Record<TxEvent, NotiOpts<Context>>
>;

export type Props<Context extends Record<string, unknown>> =
  TxEventHandlers<Context> & {
    options?: Options<Context>;
  };

const extractNotiOptions = <Context extends Record<string, unknown>>(
  context: Context,
  options: NotiOpts<Context> = {},
  explorerUrl?: string,
) => {
  const { secondaryMessage, ...restProps } = options;
  return {
    ...restProps,
    ...(typeof secondaryMessage === 'function'
      ? { secondaryMessage: secondaryMessage(context, explorerUrl) }
      : secondaryMessage !== undefined
        ? { secondaryMessage }
        : {}),
  };
};

export default function useRestakeTxEventHandlersWithNoti<
  Context extends Record<string, unknown>,
>({ options = {}, ...props }: Props<Context> = {}) {
  const { network } = useNetworkStore();
  const { notificationApi } = useWebbUI();
  const getExplorerUrl = useSubstrateExplorerUrl();

  const networkBlockExplorerUrl = network.nativeExplorerUrl;

  const getTxUrl = useCallback(
    (txHash: Hash, blockHash: Hash) => {
      // If the block explorer is the Polkadot Portal,
      // use block hash instead of the tx hash.
      // See https://polkadot.js.org/docs/api/FAQ/#which-api-can-i-use-to-query-by-transaction-hash.
      return networkBlockExplorerUrl !== undefined &&
        isPolkadotJsDashboard(networkBlockExplorerUrl)
        ? getExplorerUrl(blockHash, 'block')
        : getExplorerUrl(txHash, 'tx');
    },
    [networkBlockExplorerUrl, getExplorerUrl],
  );

  return useMemo<TxEventHandlers<Context>>(
    () => ({
      onTxSending: (context) => {
        const key = TxEvent.SENDING;

        notificationApi.addToQueue({
          key,
          Icon: <Spinner size="lg" />,
          message: 'Sending transaction...',
          variant: 'info',
          persist: true,
          ...extractNotiOptions(context, options[key]),
        });

        props?.onTxSending?.(context);
      },
      onTxInBlock: (txHash, blockHash, context) => {
        const key = TxEvent.IN_BLOCK;
        const url = getTxUrl(txHash, blockHash);

        notificationApi.remove(TxEvent.SENDING);

        notificationApi.addToQueue({
          key,
          Icon: <Spinner size="lg" />,
          message: 'Transaction is included in a block',
          secondaryMessage: <ViewTxOnExplorer url={url?.toString()} />,
          variant: 'info',
          persist: true,
          ...extractNotiOptions(context, options[key], url?.toString()),
        });

        props?.onTxInBlock?.(txHash, blockHash, context);
      },
      onTxSuccess: (txHash, blockHash, context) => {
        const key = TxEvent.SUCCESS;
        const url = getTxUrl(txHash, blockHash);

        notificationApi.remove(TxEvent.SENDING);
        notificationApi.remove(TxEvent.IN_BLOCK);
        notificationApi.remove(TxEvent.FINALIZED);

        notificationApi.addToQueue({
          key,
          message: 'Transaction finalized successfully!',
          secondaryMessage: <ViewTxOnExplorer url={url?.toString()} />,
          variant: 'success',
          ...extractNotiOptions(context, options[key], url?.toString()),
        });

        props?.onTxSuccess?.(txHash, blockHash, context);
      },
      onTxFailed: (error, context) => {
        const key = TxEvent.FAILED;

        notificationApi.remove(TxEvent.SENDING);
        notificationApi.remove(TxEvent.IN_BLOCK);
        notificationApi.remove(TxEvent.FINALIZED);

        notificationApi.addToQueue({
          key,
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
          ...extractNotiOptions(context, options[key]),
        });

        props?.onTxFailed?.(error, context);
      },
    }),
    [getTxUrl, notificationApi, options, props],
  );
}
