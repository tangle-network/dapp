'use client';

import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { FC, PropsWithChildren } from 'react';

const Provider: FC<PropsWithChildren> = ({ children }) => {
  return <WebbUIProvider defaultThemeMode="light">{children}</WebbUIProvider>;
};

export * from './FaucetProvider';

export default Provider;
