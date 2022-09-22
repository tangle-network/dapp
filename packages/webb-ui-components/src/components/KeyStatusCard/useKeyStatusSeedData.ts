import { randEthereumAddress, randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';
import { arrayFrom } from '@webb-dapp/webb-ui-components/utils';

import { KeyStatusCardDataProps } from './types.d';

export const useKeyStatusSeedData = (): KeyStatusCardDataProps => {
  return {
    title: 'Active key',
    titleInfo: 'This is active key',
    sessionNumber: randNumber({ min: 1, max: 100 }),
    keyType: 'current',
    keyVal: randEthereumAddress(),
    startTime: randRecentDate(),
    endTime: randSoonDate(),
    authorities: new Set(arrayFrom(randNumber({ min: 10, max: 20 }), () => randEthereumAddress())),
    totalAuthorities: randNumber({ min: 1, max: 30 }),
    fullDetailUrl: 'https://webb.tools',
  };
};
