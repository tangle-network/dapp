import 'antd/dist/antd.css';
import './styles/global.css';
import './styles/notification.scss';
import './styles/table.scss';

import { MuiThemeProvider, PaperProps } from '@material-ui/core';
import { darkPallet, lightPallet } from '@webb-dapp/ui-components/styling/colors';
import makeTheme from '@webb-dapp/ui-components/styling/themes/makeTheme';
import React, { FC, useMemo, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import { BareProps } from './types';
import { useStore } from '@webb-dapp/react-environment';

export interface UIData {
  phantomdata: any;
}

const AlertWrapper = styled.div<PaperProps>`
  padding: 1rem;
`;

export const UIContext = React.createContext<UIData>({ phantomdata: '' });

export const UIProvider: FC<BareProps> = ({ children }) => {
  const store = useStore('ui');
  const isDarkTheme = store.theme === 'dark';

  const [state] = useState<UIData>({ phantomdata: '' });
  const muiTheme = useMemo(() => makeTheme({}, isDarkTheme ? 'dark' : 'light'), [isDarkTheme]);
  const pallet = useMemo(() => (isDarkTheme ? darkPallet : lightPallet), [isDarkTheme]);

  return (
    <UIContext.Provider value={state}>
      <ThemeProvider theme={pallet}>
        <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
      </ThemeProvider>
    </UIContext.Provider>
  );
};
