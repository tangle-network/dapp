import Image from 'next/image';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LiquidStakingChain,
  LS_CHAIN_TO_LOGO,
} from '../../constants/liquidStaking';

export type ChainLogoSize = 'sm' | 'md';

export type ChainLogoProps = {
  chain: LiquidStakingChain;
  size: ChainLogoSize;
  isRounded?: boolean;
};

const getSizeNumber = (size: ChainLogoSize) => {
  switch (size) {
    case 'sm':
      return 24;
    case 'md':
      return 40;
  }
};

const getSizeClass = (size: ChainLogoSize) => {
  switch (size) {
    case 'sm':
      return 'min-w-[24px] min-h-[24px]';
    case 'md':
      return 'min-w-[40px] min-h-[40px]';
  }
};

const getBackgroundColor = (chain: LiquidStakingChain) => {
  switch (chain) {
    case LiquidStakingChain.MANTA:
      return 'bg-[#13101D] dark:bg-[#13101D]';
    case LiquidStakingChain.MOONBEAM:
      return 'bg-[#1d1336] dark:bg-[#1d1336]';
    case LiquidStakingChain.PHALA:
      return 'bg-black dark:bg-black';
    case LiquidStakingChain.POLKADOT:
      return 'bg-mono-0 dark:bg-mono-0';
    case LiquidStakingChain.ASTAR:
      // No background for Astar, since it looks better without
      // a background.
      return '';
  }
};

const ChainLogo: FC<ChainLogoProps> = ({
  chain,
  size = 'md',
  isRounded = false,
}) => {
  const sizeNumber = getSizeNumber(size);

  return (
    <Image
      className={twMerge(
        getSizeClass(size),
        getBackgroundColor(chain),
        isRounded ? 'rounded-full' : 'rounded-md',
      )}
      src={LS_CHAIN_TO_LOGO[chain]}
      alt={`Logo of the liquid staking token ${chain}`}
      width={sizeNumber}
      height={sizeNumber}
    />
  );
};

export default ChainLogo;
