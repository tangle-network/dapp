import { Bytes, Option, StorageKey } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import {
  PalletIdentityLegacyIdentityInfo,
  PalletIdentityRegistration,
} from '@polkadot/types/lookup';
import { ITuple } from '@polkadot/types/types';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import useEntryMap from '../../hooks/useEntryMap';

export const extractNameFromInfo = (
  info: PalletIdentityLegacyIdentityInfo
): string | null => {
  const displayNameJson = info.display.toString();

  const displayNameObject: { raw?: `0x${string}` } =
    JSON.parse(displayNameJson);

  // If the display name is in hex format, convert it to a string.
  if (displayNameObject.raw !== undefined) {
    const hexString = displayNameObject.raw;

    return Buffer.from(hexString.slice(2), 'hex').toString('utf8');
  }

  return null;
};

const mapIdentitiesToNames = (
  identities: [
    StorageKey<[AccountId32]>,
    Option<ITuple<[PalletIdentityRegistration, Option<Bytes>]>>
  ][]
): [string, string | null][] =>
  identities.map(([address, identityOpt]) => {
    const info = identityOpt.isNone ? null : identityOpt.unwrap()[0].info;

    return [
      address.args[0].toString(),
      info !== null ? extractNameFromInfo(info) : null,
    ];
  });

const useValidatorIdentityNames = () => {
  const { result: identityNames, ...other } = useApiRx(
    useCallback(
      (api) =>
        api.query.identity.identityOf.entries().pipe(map(mapIdentitiesToNames)),
      []
    )
  );

  const nameMap = useEntryMap(identityNames, (key) => key);

  return { result: nameMap, ...other };
};

export default useValidatorIdentityNames;
