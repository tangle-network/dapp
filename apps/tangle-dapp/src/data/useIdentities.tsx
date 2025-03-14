import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { extractIdentityInfo } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
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
    if (result === null) {
      return [];
    }

    return result.map((identityResult, index) => {
      if (identityResult.isNone) {
        return [addresses[index], null] as const;
      }

      const info = extractIdentityInfo(identityResult.unwrap()[0]);

      return [addresses[index], info] as const;
    });
  }, [addresses, result]);

  return { result: Object.fromEntries(identityNames), ...other };
};

export default useIdentities;
