import { PropsWithChildren } from 'react';

import { BalancesProvider } from '../../context/BalancesContext';

export default function Layout({ children }: PropsWithChildren) {
  return <BalancesProvider>{children}</BalancesProvider>;
}
