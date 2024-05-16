'use client';

import { useContext } from 'react';

import { ServiceOverviewContext } from '../../context/ServiceOverviewContext';

export default function useServiceOverview() {
  return useContext(ServiceOverviewContext);
}
