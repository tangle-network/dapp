import { PaperProps } from '@mui/material';
import { StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import InteractiveErrorView from '@webb-dapp/react-components/InteractiveFeedbackView/InteractiveErrorView';
import { useStore, useWebContext } from '@webb-dapp/react-environment';
import { darkPallet, lightPallet } from '@webb-dapp/ui-components/styling/colors';
import makeTheme from '@webb-dapp/ui-components/styling/themes/makeTheme';
import React, { FC, Fragment, useMemo, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import { GlobalStylesheet } from './styles/global';
import { BareProps } from './types';

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
  const { activeFeedback } = useWebContext();

  return (
    <>
      <GlobalStylesheet />
      <UIContext.Provider value={state}>
        <MuiThemeProvider theme={muiTheme}>
          <ThemeProvider theme={pallet}>
            <Fragment>
              {children}
              <InteractiveErrorView activeFeedback={activeFeedback} />
            </Fragment>
          </ThemeProvider>
        </MuiThemeProvider>
      </UIContext.Provider>
    </>
  );
};
