import { ReactNode } from 'react';

import ServiceOverviewContext from '../../context/ServiceOverviewContext';

export default function ServiceDetailsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ServiceOverviewContext>{children}</ServiceOverviewContext>;
}
