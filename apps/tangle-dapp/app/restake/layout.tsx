import { FC, PropsWithChildren } from 'react';

import { PolkadotApiProvider } from '../../context/PolkadotApiContext';
import RestakeProvider from '../../context/RestakeContext';

const RestakeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <PolkadotApiProvider>
      <RestakeProvider>{children}</RestakeProvider>
    </PolkadotApiProvider>
  );
};

export default RestakeLayout;
