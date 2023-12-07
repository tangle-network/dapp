import type { FC, PropsWithChildren } from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { chainsConfig } from '@webb-tools/dapp-config';

const RainbowProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <RainbowKitProvider chains={Object.values(chainsConfig)}>
      {children}
    </RainbowKitProvider>
  );
};

export default RainbowProvider;
