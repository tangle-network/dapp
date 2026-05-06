'use client';

import LoggerService from '@tangle-network/browser-utils/logger/LoggerService';
import noop from 'lodash/noop';
import { createContext } from 'react';
import { notificationApi } from '../components/Notification';
import { IUIContext } from './types';

const initialContext: IUIContext = {
  customMainComponent: undefined,
  notificationApi,
  setMainComponent: noop,
  logger: LoggerService.get('app'),
  theme: {
    isDarkMode: true,
    toggleThemeMode: noop,
  },
};

const UIContext = createContext<IUIContext>(initialContext);

export default UIContext;
