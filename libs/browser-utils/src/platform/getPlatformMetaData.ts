import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { detect } from 'detect-browser';

export enum SupportedBrowsers {
  Chrome,
  FireFox,
}

type PlatformMetaData = {
  id: SupportedBrowsers;
  name: string;
  storeName: string;
};

const getPlatformMetaData = (): PlatformMetaData | null => {
  const browser = detect();

  const name = browser?.name;

  switch (name) {
    case 'firefox':
      return {
        id: SupportedBrowsers.FireFox,
        name: 'firefox',
        storeName: 'FireFox Addons',
      };
    case 'chrome':
      return {
        id: SupportedBrowsers.Chrome,
        name: 'chrome',
        storeName: 'Chrome web store',
      };
    default:
      return null;
  }
};

export default getPlatformMetaData;
