// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { NotificationHandler, NotificationPayload } from '@webb-dapp/api-providers';

function mockNotificationHandler(notification: NotificationPayload) {
  switch (notification.name) {
    case 'Transaction': {
      return 'transaction sent';
    }

    default:
      return '';
  }
}

mockNotificationHandler.remove = (key: string | number) => {
  return key;
};

export default mockNotificationHandler as NotificationHandler;
