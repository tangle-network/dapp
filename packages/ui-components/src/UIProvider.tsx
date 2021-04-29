import 'antd/dist/antd.css';
import './styles/global.css';
import './styles/notification.scss';
import './styles/table.scss';
import React, { FC, useState } from 'react';

import { BareProps } from './types';
import { PaperProps } from '@material-ui/core';
import styled from 'styled-components';

export interface UIData {
  phantomdata: any;
}

const AlertWrapper = styled.div<PaperProps>`
  padding: 1rem;
`;

export const UIContext = React.createContext<UIData>({ phantomdata: '' });

export const UIProvider: FC<BareProps> = ({ children }) => {
  const [state] = useState<UIData>({ phantomdata: '' });

  return <UIContext.Provider value={state}>{children}</UIContext.Provider>;
};
