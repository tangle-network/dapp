import React, { createContext, FC, PropsWithChildren, useMemo } from 'react';
import { InfluxDB } from '@influxdata/influxdb-client';

// ensure it won't be null
export const ChartDataContext = createContext<InfluxDB>(null as any);

type ChartDataProviderProps = PropsWithChildren<{ url: string; token: string }>

export const ChartDataProvider: FC<ChartDataProviderProps> = ({ children, token, url }) => {
  const client = useMemo(() => {
    return new InfluxDB({
      token: token,
      url
    });
  }, [url, token]);

  return (
    <ChartDataContext.Provider value={client}>
      {children}
    </ChartDataContext.Provider>
  );
};
