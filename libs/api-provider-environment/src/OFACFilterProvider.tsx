'use client';

import { useState, useEffect, type FC, type PropsWithChildren } from 'react';
import { OFACModal } from '@webb-tools/webb-ui-components';

export type OFACFilterProviderProps = {
  isActivated: boolean;
  blockedCountryCodes: string[];
  blockedRegions: string[];
};

/**
 * Provider to block users from OFAC countries to access the website
 */
const OFACFilterProvider: FC<PropsWithChildren<OFACFilterProviderProps>> = ({
  children,
  isActivated,
  blockedCountryCodes,
  blockedRegions,
}) => {
  const [isOFAC, setIsOFAC] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isActivated) return;

    setIsFetching(true);
    fetch('https://geolocation-db.com/json/')
      .then((response) => response.json())
      .then((data) => {
        if (
          blockedCountryCodes?.includes(data.country_code) ||
          blockedRegions?.includes(data.state)
        ) {
          setIsOFAC(true);
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setIsFetching(false);
      });
  }, [blockedCountryCodes, blockedRegions, isActivated]);

  if (isFetching) {
    return null;
  }

  if (isOFAC) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <OFACModal />
      </div>
    );
  }

  return children;
};

export default OFACFilterProvider;
