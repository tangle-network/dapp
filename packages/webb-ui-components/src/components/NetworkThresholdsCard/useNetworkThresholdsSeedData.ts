import { randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';

import { NetworkThresholdsCardDataProps } from './types';

export function useNetworkThresholdsSeedData(): NetworkThresholdsCardDataProps {
  return {
    title: 'Network Thresholds',
    titleInfo: 'Network Thresholds',
    keygenThreshold: randNumber({ min: 2, max: 20 }),
    signatureThreshold: randNumber({ min: 2, max: 20 }),
    startTime: randRecentDate(),
    endTime: randSoonDate(),
    thresholdType: 'current',
    sessionNumber: randNumber({ min: 100, max: 1000 }),
    keyValue: '0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7',
    viewHistoryUrl: 'https://webb.tools',
  };
}
