import { PalletIdentityLegacyIdentityInfo } from '@polkadot/types/lookup';

import { getApiPromise } from './api';

export type IdentityType = {
  name: string | null;
  email: string | null;
  web: string | null;
  twitter: string | null;
};

export enum IdentityDataType {
  NAME = 'display',
  WEB = 'web',
  EMAIL = 'email',
  TWITTER = 'twitter',
}

export const extractDataFromIdentityInfo = (
  info: PalletIdentityLegacyIdentityInfo,
  type: IdentityDataType,
): string | null => {
  const displayData = info[type];

  if (displayData.isNone) {
    return null;
  }

  const displayDataObject: { raw?: string } = JSON.parse(
    displayData.toString(),
  );

  // If the display name is in hex format, convert it to a string.
  if (displayDataObject.raw !== undefined) {
    const hexString = displayDataObject.raw;

    return Buffer.from(hexString.slice(2), 'hex').toString('utf8');
  }

  return null;
};

export async function getAccountInfo(rpcEndpoint: string, address: string) {
  const api = await getApiPromise(rpcEndpoint);
  const identityData = await api.query.identity.identityOf(address);

  if (identityData.isSome) {
    const identity = identityData.unwrap();
    const info = identity[0]?.info;

    if (info) {
      const name = extractDataFromIdentityInfo(info, IdentityDataType.NAME);
      const email = extractDataFromIdentityInfo(info, IdentityDataType.EMAIL);
      const web = extractDataFromIdentityInfo(info, IdentityDataType.WEB);

      const twitterName = extractDataFromIdentityInfo(
        info,
        IdentityDataType.TWITTER,
      );

      const twitter =
        twitterName === null
          ? null
          : `https://twitter.com/${twitterName.substring(1)}`;

      return {
        name,
        email,
        web,
        twitter,
      } satisfies IdentityType;
    }
  }

  return null;
}
