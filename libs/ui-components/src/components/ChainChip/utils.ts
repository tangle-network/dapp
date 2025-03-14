import type { ChainGroup } from '@tangle-network/dapp-config/chains/chain-config.interface';
import type { ChainChipClassNames } from './types';

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
  athena: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#D9780E]',
  },
  cosmos: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#2E3148]',
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
    default: 'text-mono-200 dark:text-mono-200 bg-[#FFF6EB]',
  },
  orbit: {
    default: 'text-mono-0 bg-[#323653]',
  },
  'webb-dev': {
    default: 'text-mono-0 dark:text-mono-0 bg-[#D9780F]',
  },
  phala: {
    default: 'text-mono-200 dark:text-mono-200 bg-[#D1FF51]',
  },
  base: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#0052FF]',
  },
  linea: {
    default: 'text-mono-200 dark:text-mono-200 bg-[#ffffff]',
  },
  bsc: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#F0B90B]',
  },
  solana: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#000000]',
  },
  bitlayer: {
    default: 'text-mono-0 dark:text-mono-0 bg-[#000000]',
  },
};

export function getChainChipClassName(chainType: ChainGroup) {
  const { default: className } = classNames[chainType];
  return className;
}
