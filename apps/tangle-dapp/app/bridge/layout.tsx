import { FC, PropsWithChildren } from 'react';

import BridgeProvider from '../../context/BridgeContext';

const BridgeLayout: FC<PropsWithChildren> = ({ children }) => {
  return <BridgeProvider>{children}</BridgeProvider>;
};

export default BridgeLayout;
