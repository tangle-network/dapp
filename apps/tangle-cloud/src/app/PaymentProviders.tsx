import { type FC, type PropsWithChildren } from 'react';
import { CreditsProvider } from './CreditsProvider';
import { ShieldedProvider } from './ShieldedProvider';
import { WalletConnectModalProvider } from '../blueprintApps/iframe/WalletConnectModalContext';

const PaymentProviders: FC<PropsWithChildren> = ({ children }) => (
  <ShieldedProvider>
    <CreditsProvider>
      <WalletConnectModalProvider>{children}</WalletConnectModalProvider>
    </CreditsProvider>
  </ShieldedProvider>
);

export default PaymentProviders;
