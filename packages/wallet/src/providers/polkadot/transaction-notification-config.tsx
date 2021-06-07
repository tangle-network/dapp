import { NotificationConfig } from '@webb-dapp/react-environment/api-providers/polkadot-transaction';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { FormatAddress } from '@webb-dapp/react-components';
import { Spinner } from '@webb-dapp/ui-components/Spinner/Spinner';
import React from 'react';

export const transactionNotificationConfig: NotificationConfig = {
  failed(data) {
    notificationApi({
      extras: {
        persist: false,
      },
      key: data.key,
      message: data.data,
      variant: 'error',
    });
  },
  loading(data) {
    notificationApi({
      extras: {
        persist: true,
      },
      key: data.key,
      message: <FormatAddress address={data.address} />,
      secondaryMessage: `${data.path.section}: ${data.path.method}`,
      variant: 'info',
      // eslint-disable-next-line sort-keys
      Icon: <Spinner />,
      transparent: true,
    });
  },
  finalize(data) {
    notificationApi({
      extras: {
        persist: false,
      },
      message: 'Submit Transaction Success',
      key: data.key,
      variant: 'success',
    });
    setTimeout(() => notificationApi.remove(data.key), 6000);
  },
};
