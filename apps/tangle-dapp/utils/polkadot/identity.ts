import { PalletIdentityLegacyIdentityInfo } from '@polkadot/types/lookup';

export enum IdentityDataType {
  NAME = 'display',
  WEB = 'web',
  EMAIL = 'email',
  TWITTER = 'twitter',
}

export const extractDataFromIdentityInfo = (
  info: PalletIdentityLegacyIdentityInfo,
  type: IdentityDataType
): string | null => {
  const displayData = info[type];
  if (displayData.isNone) return null;

  const displayDataObject: { raw?: string } = JSON.parse(
    displayData.toString()
  );

  // If the display name is in hex format, convert it to a string.
  if (displayDataObject.raw !== undefined) {
    const hexString = displayDataObject.raw;

    return Buffer.from(hexString.slice(2), 'hex').toString('utf8');
  }

  return null;
};
