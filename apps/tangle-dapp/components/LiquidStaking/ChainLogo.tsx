import Image from 'next/image';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LIQUID_STAKING_CHAIN_MAP,
  LiquidStakingChainId,
} from '../../constants/liquidStaking';

export type ChainLogoSize = 'sm' | 'md';

export type ChainLogoProps = {
  chainId: LiquidStakingChainId;
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

const getBackgroundColor = (chain: LiquidStakingChainId) => {
  switch (chain) {
    case LiquidStakingChainId.MANTA:
      return 'bg-[#13101D] dark:bg-[#13101D]';
    case LiquidStakingChainId.MOONBEAM:
      return 'bg-[#1d1336] dark:bg-[#1d1336]';
    case LiquidStakingChainId.PHALA:
      return 'bg-black dark:bg-black';
    case LiquidStakingChainId.POLKADOT:
      return 'bg-mono-0 dark:bg-mono-0';
    case LiquidStakingChainId.ASTAR:
      // No background for Astar, since it looks better without
      // a background.
      return '';
  }
};

const ChainLogo: FC<ChainLogoProps> = ({
  chainId,
  size = 'md',
  isRounded = false,
}) => {
  const sizeNumber = getSizeNumber(size);

  return (
    <Image
      className={twMerge(
        getSizeClass(size),
        getBackgroundColor(chainId),
        isRounded ? 'rounded-full' : 'rounded-md',
      )}
      src={LIQUID_STAKING_CHAIN_MAP[chainId].logo}
      alt={`Logo of the liquid staking token ${chainId}`}
      width={sizeNumber}
      height={sizeNumber}
    />
  );
};

export default ChainLogo;
