import { getApiPromise } from './api';
import { hexToString, isHex } from 'viem';
import {
  GithubFill,
  GlobalLine,
  Mail,
  TwitterFill,
} from '@tangle-network/icons';

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

export const IDENTITY_ICONS_RECORD = {
  [IdentityDataType.TWITTER]: TwitterFill,
  [IdentityDataType.EMAIL]: Mail,
  [IdentityDataType.WEB]: GlobalLine,
  github: GithubFill,
};

type OptionLike<T = unknown> = {
  isNone: boolean;
  unwrap: () => T;
  toString: () => string;
};

type IdentityInfoLike = Record<string, OptionLike>;

type IdentityRegistrationLike = {
  info: IdentityInfoLike;
};

export const extractDataFromIdentityInfo = (
  info: IdentityInfoLike,
  type: IdentityDataType,
): string | null => {
  const displayData = info[type] as OptionLike;

  if (displayData.isNone) {
    return null;
  }

  const displayDataObject: { raw?: string } = JSON.parse(
    displayData.toString(),
  );

  // If the display name is in hex format, convert it to a string.
  if (displayDataObject.raw !== undefined && isHex(displayDataObject.raw)) {
    return hexToString(displayDataObject.raw);
  }

  return null;
};

export const extractIdentityInfo = (
  identityRegistration: IdentityRegistrationLike,
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

export async function getAccountInfo(
  rpcEndpoints: string | string[],
  address: string,
) {
  const api = await getApiPromise(rpcEndpoints);
  const identityData = (await api.query.identity.identityOf(
    address,
  )) as unknown as OptionLike<[IdentityRegistrationLike]>;

  if (identityData.isNone) {
    return null;
  }

  const [identityRegistration] = identityData.unwrap();

  return extractIdentityInfo(identityRegistration);
}

/**
 * Retrieves identity information for multiple accounts.
 *
 * @param rpcEndpoints - The RPC endpoint URLs for the Polkadot node.
 * @param addresses - An array of account addresses to fetch identity information for.
 * @returns A Promise that resolves to an array of IdentityType objects or null values.
 *          Each element corresponds to an address in the input array.
 *          If an address has no identity information, the corresponding element will be null.
 */
export async function getMultipleAccountInfo(
  rpcEndpoints: string | string[],
  addresses: string[],
): Promise<(IdentityType | null)[]> {
  const api = await getApiPromise(rpcEndpoints);
  const identityData = (await api.query.identity.identityOf.multi(
    addresses,
  )) as unknown as Array<OptionLike<[IdentityRegistrationLike]>>;

  return identityData.map((data) => {
    if (data.isNone) {
      return null;
    }

    const [registration] = data.unwrap();

    return extractIdentityInfo(registration);
  });
}
