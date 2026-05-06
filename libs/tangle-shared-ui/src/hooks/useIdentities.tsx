import { extractIdentityInfo } from '../utils/polkadot/identity';
import { useCallback, useMemo } from 'react';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import useApi from './useApi';

const useIdentities = (
  singleOrMultipleValidatorAddresses: SubstrateAddress | SubstrateAddress[],
) => {
  let addresses: SubstrateAddress[];

  if (Array.isArray(singleOrMultipleValidatorAddresses)) {
    addresses = singleOrMultipleValidatorAddresses;
  } else {
    addresses = [singleOrMultipleValidatorAddresses];
  }

  const { result, ...other } = useApi(
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

  return { result: new Map(identityNames), ...other };
};

export default useIdentities;
