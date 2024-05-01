'use client';

import { createContext, FC, PropsWithChildren } from 'react';

import { Service } from '../types';

export const ServiceDetailsContext = createContext<Service | null>(null);

const ServiceDetailsProvider: FC<PropsWithChildren<{ serviceId: string }>> = ({
  children,
  serviceId,
}) => {
  // TODO: Fetch service details

  return (
    <ServiceDetailsContext.Provider value={null}>
      {children}
    </ServiceDetailsContext.Provider>
  );
};

export default ServiceDetailsProvider;
