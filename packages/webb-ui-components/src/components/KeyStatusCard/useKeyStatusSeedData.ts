import { randEthereumAddress, randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';

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
    authorities: {
      nepoche: {
        id: 'nepoche',
        avatarUrl: 'https://github.com/nepoche.png',
      },
      AhmedKorim: {
        id: 'AhmedKorim',
        avatarUrl: 'https://github.com/AhmedKorim.png',
      },
      AtelyPham: {
        id: 'AtelyPham',
        avatarUrl: 'https://github.com/AtelyPham.png',
      },
    },
    totalAuthorities: randNumber({ min: 1, max: 30 }),
    fullDetailUrl: 'https://webb.tools',
  };
};
