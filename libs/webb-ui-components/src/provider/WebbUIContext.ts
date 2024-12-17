'use client';

import LoggerService from '@webb-tools/browser-utils/logger/LoggerService';
import noop from 'lodash/noop';
import { createContext } from 'react';
import { notificationApi } from '../components/Notification';
import { IWebbUIContext } from './types';

const initialContext: IWebbUIContext = {
  customMainComponent: undefined,
  notificationApi,
  setMainComponent: noop,
  logger: LoggerService.get('app'),
  theme: {
    isDarkMode: true,
    toggleThemeMode: noop,
  },
};

const WebbUIContext = createContext<IWebbUIContext>(initialContext);

export default WebbUIContext;
