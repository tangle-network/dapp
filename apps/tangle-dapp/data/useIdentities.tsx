import { useCallback, useMemo } from 'react';

import useApiRx from '../hooks/useApiRx';
import { extractIdentityInfo } from '../utils/polkadot';

const useIdentities = (
  singleOrMultipleValidatorAddresses: string | string[],
) => {
  let addresses: string[];

  if (Array.isArray(singleOrMultipleValidatorAddresses)) {
    addresses = singleOrMultipleValidatorAddresses;
  } else {
    addresses = [singleOrMultipleValidatorAddresses];
  }

  const { result, ...other } = useApiRx(
    useCallback(
      (api) => api.query.identity.identityOf.multi(addresses),
      [addresses],
    ),
  );

  const identityNames = useMemo(() => {
    if (result === null) return [];

    return result.map((identityResult, idx) => {
      if (identityResult.isNone) {
        return [addresses[idx], null] as const;
      }

      const info = extractIdentityInfo(identityResult.unwrap()[0]);

      return [addresses[idx], info] as const;
    });
  }, [addresses, result]);

  return { result: Object.fromEntries(identityNames), ...other };
};

export default useIdentities;
