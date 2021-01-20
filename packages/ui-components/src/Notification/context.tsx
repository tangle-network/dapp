import { createContext } from 'react';
import { NotificationConfig, PartialNotificationConfig } from './types';

export type CreateNotification = (config: PartialNotificationConfig) => NotificationConfig;

export interface NotificationContextData {
  createNotification: CreateNotification;
}

export const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);
