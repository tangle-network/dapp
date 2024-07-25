'use client';

import { useState, useEffect, type FC, type PropsWithChildren } from 'react';
import { OFACModal } from '@webb-tools/webb-ui-components';

export type OFACFilterProviderProps = {
  isActivated?: boolean;
  blockedCountryCodes?: string[];
  blockedRegions?: string[];
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

  useEffect(() => {
    if (!isActivated) return;

    let isMounted = true;

    fetch('https://geolocation-db.com/json/')
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted) return; // Check if the component is still mounted before proceeding

        const { country_code, state } = data;

        const isBlockedByCountryCode =
          typeof country_code === 'string' &&
          blockedCountryCodes &&
          blockedCountryCodes.find(
            (code) => code.toLowerCase() === country_code.toLowerCase(),
          );

        const isBlockedByRegion =
          typeof state === 'string' &&
          blockedRegions &&
          blockedRegions.find(
            (region) => region.toLowerCase() === state.toLowerCase(),
          );

        if (isBlockedByCountryCode || isBlockedByRegion) {
          setIsOFAC(true);
        }
      })
      .catch((error) => console.log(error));

    return () => {
      isMounted = false;
    };
  }, [blockedCountryCodes, blockedRegions, isActivated]);

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
