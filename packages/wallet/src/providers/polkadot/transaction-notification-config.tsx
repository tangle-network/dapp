import { NotificationConfig } from '@webb-dapp/react-environment/api-providers/polkadot';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { Spinner } from '@webb-dapp/ui-components/Spinner/Spinner';
import React from 'react';

export const transactionNotificationConfig: NotificationConfig = {
  failed(data) {
    return notificationApi({
      extras: {
        persist: false,
      },
      key: data.key,
      message: data.data,
      variant: 'error',
    });
  },
  loading(data) {
    return notificationApi({
      extras: {
        persist: true,
      },
      key: data.key,
      message: data.data,
      secondaryMessage: `${data.path.section}: ${data.path.method}`,
      variant: 'info',
      // eslint-disable-next-line sort-keys
      Icon: <Spinner />,
      transparent: true,
    });
  },
  finalize(data) {
    const notificationId = notificationApi({
      extras: {
        persist: false,
      },
      message: data.data ?? 'Submit Transaction Success',
      key: data.key,
      variant: 'success',
    });
    setTimeout(() => notificationApi.remove(data.key), 6000);
    return notificationId;
  },
};
