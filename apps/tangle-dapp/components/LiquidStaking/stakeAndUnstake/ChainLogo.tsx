import Image from 'next/image';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LS_CHAIN_MAP,
  LsParachainChainId,
} from '../../../constants/liquidStaking/liquidStakingParachain';

export type ChainLogoSize = 'sm' | 'md';

export type ChainLogoProps = {
  chainId?: LsParachainChainId;
  size: ChainLogoSize;
  isRounded?: boolean;
  isLiquidVariant?: boolean;
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

const getBackgroundColor = (chain: LsParachainChainId) => {
  switch (chain) {
    case LsParachainChainId.MANTA:
      return 'bg-[#13101D] dark:bg-[#13101D]';
    case LsParachainChainId.MOONBEAM:
      return 'bg-[#1d1336] dark:bg-[#1d1336]';
    case LsParachainChainId.PHALA:
      return 'bg-black dark:bg-black';
    case LsParachainChainId.POLKADOT:
      return 'bg-mono-0 dark:bg-mono-0';
    case LsParachainChainId.TANGLE_RESTAKING_PARACHAIN:
      // Fix the icon SVG getting cut off on the sides by adding
      // a matching background.
      return 'bg-[#f6f4ff]';
    case LsParachainChainId.ASTAR:
      // No background for Astar, since it looks better without
      // a background.
      return '';
  }
};

const ChainLogo: FC<ChainLogoProps> = ({
  chainId,
  size = 'md',
  isRounded = false,
  isLiquidVariant = false,
}) => {
  const sizeNumber = getSizeNumber(size);

  // In case the chain id is not provided, render a placeholder.
  if (chainId === undefined) {
    return (
      <div
        className={twMerge(
          getSizeClass(size),
          'bg-mono-40 dark:bg-mono-140 rounded-md',
        )}
      />
    );
  }

  return (
    <div
      className={twMerge(
        isRounded ? 'rounded-full' : 'rounded-md',
        isRounded && isLiquidVariant && 'border-2 border-primary p-[1px]',
      )}
    >
      <Image
        className={twMerge(
          getSizeClass(size),
          getBackgroundColor(chainId),
          isRounded ? 'rounded-full' : 'rounded-md',
        )}
        src={LS_CHAIN_MAP[chainId].logo}
        alt={`Logo of the liquid staking token ${chainId}`}
        width={sizeNumber}
        height={sizeNumber}
      />
    </div>
  );
};

export default ChainLogo;
