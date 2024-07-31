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
    if (!isActivated) {
      return;
    }

    let isMounted = true;

    // TODO: This needs to be re-implemented, the site is currently down. Look for a more reliable alternative. Also, when it is re-implemented, it should be done in an efficiency-conscious way, since this is a blocking operation. Example: Should have a timeout, and save the result in local storage for further site visits from the same device.
    fetch('https://geolocation-db.com/json/')
      .then((response) => response.json())
      .then((data: { country_code: unknown; state: unknown }) => {
        // Check if the component is still mounted before proceeding
        if (!isMounted) {
          return;
        }

        const { country_code, state } = data;

        const isBlockedByCountryCode =
          typeof country_code === 'string' &&
          blockedCountryCodes &&
          blockedCountryCodes.find(
            (code) => code.toLowerCase() === country_code.toLowerCase(),
          ) !== undefined;

        const isBlockedByRegion =
          typeof state === 'string' &&
          blockedRegions &&
          blockedRegions.find(
            (region) => region.toLowerCase() === state.toLowerCase(),
          ) !== undefined;

        if (isBlockedByCountryCode === true || isBlockedByRegion === true) {
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
