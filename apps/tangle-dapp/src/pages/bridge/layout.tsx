import { FC } from 'react';

import { Outlet } from 'react-router';
import BridgeProvider from '../../context/BridgeContext';

const BridgeLayout: FC = () => {
  return (
    <BridgeProvider>
      <Outlet />
    </BridgeProvider>
  );
};

export default BridgeLayout;
