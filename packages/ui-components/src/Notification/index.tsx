import React, { FC, PropsWithChildren, useState, useRef, useEffect, memo } from 'react';

import { NotificationContext } from './context';
import { NotificationConfig, PartialNotificationConfig } from './types';
import { NotificationDisplay } from './NotificationDisplay';

export { NotificationContext };

let notifiactionId = 0;

export const Notification: FC<PropsWithChildren<{}>> = memo(({ children }) => {
  const [notifications, _setNotifications] = useState<NotificationConfig[]>([]);
  const notificationsRef = useRef<NotificationConfig[]>([]);

  const setNotifications = (configs: NotificationConfig[]): void => {
    notificationsRef.current = configs;
    _setNotifications(configs);
  };

  const addNotification = (config: NotificationConfig): void => {
    const _configs = notificationsRef.current.slice();

    _configs.push(config);
    setNotifications(_configs);
  };

  const createNotification = (config: PartialNotificationConfig): NotificationConfig => {
    const id = notifiactionId++;

    const update = (config: Partial<NotificationConfig>): void => {
      const _configs = notificationsRef.current.map((item) => {
        if (item.id === id) {
          return { ...item, ...config };
        }

        return item;
      });

      setNotifications(_configs);
    };

    const remove = (delay = 0): void => {
      setTimeout(() => {
        const _configs = notificationsRef.current.filter((item) => {
          return item.id !== id;
        });

        setNotifications(_configs);
      }, delay);
    };

    const _config = { ...config, id, remove, update };

    addNotification(_config);

    return _config;
  };

  useEffect(() => {
    notifications.forEach((item) => {
      if (item.removedDelay) {
        item.remove(item.removedDelay);
      }
    });
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{ createNotification }}
    >
      <NotificationDisplay data={notifications} />
      {children}
    </NotificationContext.Provider>
  );
});

Notification.displayName = 'Notification Provider';
