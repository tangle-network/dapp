import { PropsWithChildren } from 'react';

import { BalancesProvider } from '../../context/BalancesContext';

export const dynamic = 'force-static';

export default function Layout({ children }: PropsWithChildren) {
  return <BalancesProvider>{children}</BalancesProvider>;
}
