import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { extractIdentityInfo } from '@webb-tools/tangle-shared-ui/utils/polkadot/identity';
import { useCallback, useMemo } from 'react';

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
