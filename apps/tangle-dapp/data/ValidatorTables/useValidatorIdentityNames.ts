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
): [StorageKey<[AccountId32]>, string | null][] =>
  identities.map(([address, identityOpt]) => {
    const info: PalletIdentityLegacyIdentityInfo | null = identityOpt.isNone
      ? null
      : // TODO: Substrate types are outdated; awaiting fix. Temporarily using `any`.
        (identityOpt.unwrap() as any).info;

    return [address, info !== null ? extractNameFromInfo(info) : null];
  });

const useValidatorIdentityNames = () =>
  usePolkadotApiRx(
    useCallback(
      (api) =>
        api.query.identity.identityOf.entries().pipe(map(mapIdentitiesToNames)),
      []
    )
  );

export default useValidatorIdentityNames;
