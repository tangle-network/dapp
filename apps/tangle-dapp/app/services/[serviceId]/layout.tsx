import { ReactNode } from 'react';

import ServiceDetailsProvider from '../../../context/ServiceDetailsContext';

export default function ServiceDetailsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { serviceId: string };
}) {
  const { serviceId } = params;
  return (
    <ServiceDetailsProvider serviceId={serviceId}>
      {children}
    </ServiceDetailsProvider>
  );
}
