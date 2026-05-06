'use client';

import { createContext } from 'react';
import { NotificationCTXDefaultValue } from './NotificationCTXDefaultValue';
import { NotificationContextProps } from './types';

export const NotificationContext = createContext<NotificationContextProps>(
  NotificationCTXDefaultValue,
);
