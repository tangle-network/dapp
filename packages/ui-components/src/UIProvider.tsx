import 'antd/dist/antd.css';
import './styles/global.css';
import './styles/notification.scss';
import './styles/table.scss';

import { MuiThemeProvider, PaperProps } from '@material-ui/core';
import { useStore } from '@webb-dapp/react-environment';
import { useLocalStorage } from '@webb-dapp/react-hooks/useLocalStorage';
import { darkPallet, lightPallet } from '@webb-dapp/ui-components/styling/colors';
import makeTheme from '@webb-dapp/ui-components/styling/themes/makeTheme';
import React, { FC, useEffect, useMemo, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import { BareProps } from './types';

export interface UIData {
  phantomdata: any;
}

const AlertWrapper = styled.div<PaperProps>`
  padding: 1rem;
`;

export const UIContext = React.createContext<UIData>({ phantomdata: '' });

export const UIProvider: FC<BareProps> = ({ children }) => {
  const ui = useStore('ui');
  const isDarkTheme = ui.theme ? ui.theme === 'primary' : true;

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
