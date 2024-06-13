'use client';

import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import TabsContainer from '../../components/TabsContainer/TabsContainer';

export default function Card({ children, ...props }: PropsOf<'div'>) {
  const pathname = usePathname();

  const lastRoute = useMemo(() => {
    const paths = pathname.split('/');

    return paths.length ? paths[paths.length - 1] : '/';
  }, [pathname]);

  return (
    <TabsContainer
      {...props}
      activeTab={lastRoute}
      tabs={['deposit', 'delegate']}
    >
      {children}
    </TabsContainer>
  );
}
