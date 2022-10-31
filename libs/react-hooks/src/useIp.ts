import { useEffect, useState } from 'react';

import { useFetch } from './useFetch';

export function useIp() {
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

  return {
    ip,
    countryCode,
    city,
  };
}
