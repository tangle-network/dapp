import { type FC, type PropsWithChildren } from 'react';
import { CreditsProvider } from './CreditsProvider';
import { ShieldedProvider } from './ShieldedProvider';

const PaymentProviders: FC<PropsWithChildren> = ({ children }) => (
  <ShieldedProvider>
    <CreditsProvider>{children}</CreditsProvider>
  </ShieldedProvider>
);

export default PaymentProviders;
