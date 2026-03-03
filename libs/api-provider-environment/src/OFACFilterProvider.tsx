'use client';

import { useState, useEffect, type FC, type PropsWithChildren } from 'react';
import { OFACModal } from '@tangle-network/ui-components';

export type OFACFilterProviderProps = {
  isActivated?: boolean;
  blockedCountryCodes?: string[];
  blockedRegions?: string[];
};

const GEO_CACHE_KEY = 'ofacGeoCache:v1';
const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const GEO_LOOKUP_TIMEOUT_MS = 5_000;

type GeoLookupResponse = {
  country_code: unknown;
  state: unknown;
};

type GeoCacheEntry = {
  timestamp: number;
  countryCode: string | null;
  state: string | null;
};

const shouldBlockRegion = (
  countryCode: string | null,
  state: string | null,
  blockedCountryCodes?: string[],
  blockedRegions?: string[],
) => {
  const normalizedCountry = countryCode?.toLowerCase() ?? null;
  const normalizedState = state?.toLowerCase() ?? null;

  const blockedByCountry =
    normalizedCountry !== null &&
    blockedCountryCodes?.some(
      (code) => code.toLowerCase() === normalizedCountry,
    ) === true;

  const blockedByState =
    normalizedState !== null &&
    blockedRegions?.some((region) => region.toLowerCase() === normalizedState) ===
      true;

  return blockedByCountry || blockedByState;
};

const readGeoCache = (): GeoCacheEntry | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(GEO_CACHE_KEY);
  if (raw === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GeoCacheEntry;
    if (
      typeof parsed.timestamp !== 'number' ||
      Date.now() - parsed.timestamp > GEO_CACHE_TTL_MS
    ) {
      localStorage.removeItem(GEO_CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(GEO_CACHE_KEY);
    return null;
  }
};

const writeGeoCache = (entry: Omit<GeoCacheEntry, 'timestamp'>) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(
    GEO_CACHE_KEY,
    JSON.stringify({
      ...entry,
      timestamp: Date.now(),
    } satisfies GeoCacheEntry),
  );
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

    if (process.env.NODE_ENV === 'test') {
      return;
    }

    let isMounted = true;
    const abortController =
      typeof globalThis.AbortController === 'function'
        ? new globalThis.AbortController()
        : null;
    const timeoutId = window.setTimeout(() => {
      abortController?.abort();
    }, GEO_LOOKUP_TIMEOUT_MS);

    const evaluateResult = (countryCode: string | null, state: string | null) => {
      if (
        shouldBlockRegion(
          countryCode,
          state,
          blockedCountryCodes,
          blockedRegions,
        )
      ) {
        setIsOFAC(true);
      }
    };

    const cachedGeoData = readGeoCache();
    if (cachedGeoData !== null) {
      evaluateResult(cachedGeoData.countryCode, cachedGeoData.state);
      window.clearTimeout(timeoutId);
      return () => {
        isMounted = false;
      };
    }

    fetch('https://geolocation-db.com/json/', {
      ...(abortController !== null
        ? { signal: abortController.signal }
        : {}),
    })
      .then((response) => response.json() as Promise<GeoLookupResponse>)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const countryCode =
          typeof data.country_code === 'string' ? data.country_code : null;
        const state = typeof data.state === 'string' ? data.state : null;

        writeGeoCache({ countryCode, state });
        evaluateResult(countryCode, state);
      })
      .catch((error) => {
        // Fail open when geolocation is unavailable.
        console.warn('Failed to resolve geolocation for OFAC filter', error);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      isMounted = false;
      abortController?.abort();
      window.clearTimeout(timeoutId);
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
