import 'antd/dist/antd.css';
import './styles/global.css';
import './styles/notification.scss';
import './styles/table.scss';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { BareProps } from './types';
import { MuiThemeProvider, PaperProps } from '@material-ui/core';
import styled, { ThemeProvider } from 'styled-components';
import makeTheme from '@webb-dapp/ui-components/styling/themes/makeTheme';
import { darkPallet, lightPallet } from '@webb-dapp/ui-components/styling/colors';
import { useStore } from '@webb-dapp/react-environment';
import { useLocalStorage } from '@webb-dapp/react-hooks/useLocalStorage';

export interface UIData {
  phantomdata: any;
}

const AlertWrapper = styled.div<PaperProps>`
  padding: 1rem;
`;

export const UIContext = React.createContext<UIData>({ phantomdata: '' });

export const UIProvider: FC<BareProps> = ({ children }) => {
  const ui = useStore('ui');
  const [theme, setTheme] = useLocalStorage('_theme');
  const isDarkTheme = theme ? theme === 'primary' : true;
  useEffect(() => {
    if (theme !== ui.theme) {
      setTheme(ui.theme);
    }
  }, [setTheme, theme, ui.theme]);

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
