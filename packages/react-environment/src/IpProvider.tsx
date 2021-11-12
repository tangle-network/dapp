import { useFetch } from '@webb-dapp/react-hooks/useFetch';
import React, { createContext, FC, PropsWithChildren, useEffect, useState } from 'react';

export interface IpInformation {
  ip: string;
  countryCode: string;
  city: string;
}

export const IpContext = createContext<IpInformation>({
  ip: '',
  countryCode: '',
  city: '',
});

export const IpProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [ip, setIp] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [city, setCity] = useState('');

  const data = useFetch(`https://ipapi.co//json`, {});

  useEffect(() => {
    if (data.ip) {
      setIp(data.ip);
    }
    if (data.country_code_iso3) {
      setCountryCode(data.country_code_iso3);
    }
    if (data.city) {
      setCity(data.city);
    }
    if (data.error) {
      setCountryCode('unknown');
    }
  }, [data]);

  return (
    <IpContext.Provider
      value={{
        ip,
        countryCode,
        city,
      }}
    >
      {children}
    </IpContext.Provider>
  );
};

export const useIp = () => {
  return React.useContext(IpContext) as IpInformation;
};
