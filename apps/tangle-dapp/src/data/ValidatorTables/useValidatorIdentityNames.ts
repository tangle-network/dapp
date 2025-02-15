import { Bytes, Option, StorageKey } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import { PalletIdentityRegistration } from '@polkadot/types/lookup';
import { ITuple } from '@polkadot/types/types';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import {
  extractDataFromIdentityInfo,
  IdentityDataType,
} from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useEntryMap from '../../hooks/useEntryMap';

const mapIdentitiesToNames = (
  identities: [
    StorageKey<[AccountId32]>,
    Option<ITuple<[PalletIdentityRegistration, Option<Bytes>]>>,
  ][],
): [string, string | null][] =>
  identities.map(([address, identityOpt]) => {
    const info = identityOpt.isNone ? null : identityOpt.unwrap()[0].info;

    return [
      address.args[0].toString(),
      info !== null
        ? extractDataFromIdentityInfo(info, IdentityDataType.NAME)
        : null,
    ];
  });

const useValidatorIdentityNames = () => {
  const { result: identityNames, ...other } = useApiRx(
    useCallback(
      (api) =>
        api.query.identity.identityOf.entries().pipe(map(mapIdentitiesToNames)),
      [],
    ),
  );

  const nameMap = useEntryMap(
    identityNames,
    useCallback((key) => key, []),
  );

  return { result: nameMap, ...other };
};

export default useValidatorIdentityNames;
