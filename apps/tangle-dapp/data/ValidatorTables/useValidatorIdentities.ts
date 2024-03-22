import { Bytes, Option, StorageKey } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import {
  PalletIdentityLegacyIdentityInfo,
  PalletIdentityRegistration,
} from '@polkadot/types/lookup';
import { ITuple } from '@polkadot/types/types';
import { useCallback } from 'react';
import { map } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

const extractNameFromInfo = (
  info: PalletIdentityLegacyIdentityInfo
): string | null => {
  const displayNameRawString = info.display.toString();

  const displayNameObject: { raw?: `0x${string}` } =
    JSON.parse(displayNameRawString);

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
): [StorageKey<[AccountId32]>, string | null][] =>
  identities.map(([address, identity]) => {
    const name = identity.isNone
      ? null
      : extractNameFromInfo(identity.unwrap()[0].info);

    return [address, name];
  });

const useValidatorIdentities = () => {
  const a = usePolkadotApiRx(
    useCallback(
      (api) =>
        api.query.identity.identityOf.entries().pipe(map(mapIdentitiesToNames)),
      []
    )
  );

  console.debug(a.data);

  return a;
};

export default useValidatorIdentities;
