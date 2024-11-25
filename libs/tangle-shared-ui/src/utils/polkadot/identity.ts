import type {
  PalletIdentityLegacyIdentityInfo,
  PalletIdentityRegistration,
} from '@polkadot/types/lookup';
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

export const extractIdentityInfo = (
  identityRegistration: PalletIdentityRegistration,
): IdentityType => {
  const info = identityRegistration.info;

  const name = extractDataFromIdentityInfo(info, IdentityDataType.NAME);
  const email = extractDataFromIdentityInfo(info, IdentityDataType.EMAIL);
  const web = extractDataFromIdentityInfo(info, IdentityDataType.WEB);

  const twitterName = extractDataFromIdentityInfo(
    info,
    IdentityDataType.TWITTER,
  );

  const twitter =
    twitterName === null ? null : `https://x.com/${twitterName.substring(1)}`;

  return {
    name,
    email,
    web,
    twitter,
  } satisfies IdentityType;
};

export async function getAccountInfo(rpcEndpoint: string, address: string) {
  const api = await getApiPromise(rpcEndpoint);
  const identityData = await api.query.identity.identityOf(address);

  if (identityData.isNone) return null;

  const [identityRegistration] = identityData.unwrap();

  return extractIdentityInfo(identityRegistration);
}

/**
 * Retrieves identity information for multiple accounts.
 *
 * @param rpcEndpoint - The RPC endpoint URL for the Polkadot node.
 * @param addresses - An array of account addresses to fetch identity information for.
 * @returns A Promise that resolves to an array of IdentityType objects or null values.
 *          Each element corresponds to an address in the input array.
 *          If an address has no identity information, the corresponding element will be null.
 */
export async function getMultipleAccountInfo(
  rpcEndpoint: string,
  addresses: string[],
): Promise<(IdentityType | null)[]> {
  const api = await getApiPromise(rpcEndpoint);
  const identityData = await api.query.identity.identityOf.multi(addresses);

  return identityData.map((data) => {
    if (data.isNone) return null;

    const [registration] = data.unwrap();

    return extractIdentityInfo(registration);
  });
}
