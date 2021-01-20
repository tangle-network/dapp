import { createElement } from 'react';
import { notification, message, Modal } from 'antd';

import { ReactComponent as InfoIcon } from './assets/notification-icon-info.svg';
import { ReactComponent as ErrorIcon } from './assets/notification-icon-error.svg';
import { ReactComponent as SuccessIcon } from './assets/notification-icon-success.svg';
import { ReactComponent as WarningIcon } from './assets/notification-icon-warning.svg';

const notificationType = ['warning', 'error', 'info', 'success'];
const notificationIconMap = new Map([
  ['error', ErrorIcon],
  ['info', InfoIcon],
  ['success', SuccessIcon],
  ['warning', WarningIcon]
]);

const handler = (type: string): ProxyHandler<any> => ({
  apply (target, ctx, args): any {
    args[0] = {
      // set className and icon for different type of notification
      className: type,
      icon: args[0].icon === undefined ? notificationIconMap.has(type)
        ? createElement(notificationIconMap.get(type) as any) : undefined : undefined,
      top: 100,
      ...args[0]
    };

    return Reflect.apply(target, ctx, args);
  }
});

Object.keys(notification).forEach((key) => {
  if (notificationType.find((i) => key === i)) {
    const method = (notification as any)[key];

    (notification as any)[key] = new Proxy(method, handler(key));
  }
});

export { notification, message, Modal };
