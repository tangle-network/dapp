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
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!isActivated) return;

    setIsFetching(true);

    fetch('https://geolocation-db.com/json/')
      .then((response) => response.json())
      .then((data) => {
        const { country_code, state } = data;

        const isBlockedByCountryCode =
          typeof country_code === 'string' &&
          blockedCountryCodes &&
          blockedCountryCodes.find(
            (code) => code.toLowerCase() === country_code.toLowerCase()
          );

        const isBlockedByRegion =
          typeof state === 'string' &&
          blockedRegions &&
          blockedRegions.find(
            (region) => region.toLowerCase() === state.toLowerCase()
          );

        if (isBlockedByCountryCode || isBlockedByRegion) {
          setIsOFAC(true);
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        if (mounted) {
          setIsFetching(false);
        }
      });

    return () => {
      mounted = false;
    };
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
