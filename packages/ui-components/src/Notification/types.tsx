import { ReactNode } from 'react';

export interface NotificationConfig {
  id: number;
  icon?: ReactNode | 'loading' | 'success' | 'failed';
  title?: ReactNode;
  content?: ReactNode;
  removedDelay?: number;
  type?: 'info' | 'success' | 'error';
  remove: (delay?: number) => void;
  update: (config: Partial<NotificationConfig>) => void;
}

export interface PartialNotificationConfig {
  icon?: Omit<ReactNode, 'string'> | 'loading' | 'success' | 'failed';
  title?: ReactNode;
  type?: 'info' | 'success' | 'error';
  content?: ReactNode;
  removedDelay?: number;
}
