import { ChainBase } from '@webb-tools/dapp-config';
import { ChainChipClassNames } from './types';

const classNames: ChainChipClassNames = {
  polygon: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#8247E5]',
  },
  ethereum: {
    default: 'text-mono-200 dark:text-mono-200 bg-[#EDF0F4]',
  },
  optimism: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#FF0420]',
  },
  kusama: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#000000]',
  },
  moonbeam: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#1D1336]',
  },
  polkadot: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#E6007A]',
  },
  arbitrum: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#2C374B]',
  },
  avalanche: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#E84142]',
  },
  tangle: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#221C41]',
  },
  scroll: {
    default: 'text-mono-200 dark:text-mono-200 bg-[#F7F8F7]',
  },
  'webb-dev': {
    default: 'text-mono-0 dark:text-mono-0 bg-[#D9780F]',
  },
};

export function getChainChipClassName(chainType: ChainBase) {
  const { default: className } = classNames[chainType];
  return className;
}
