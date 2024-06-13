import Image from 'next/image';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LiquidStakingChain,
  LS_CHAIN_TO_LOGO,
} from '../../constants/liquidStaking';

export type TokenSize = 'sm' | 'md';

export type TokenLogoProps = {
  chain: LiquidStakingChain;
  size: TokenSize;
  isRounded?: boolean;
};

const getSizeNumber = (size: TokenSize) => {
  switch (size) {
    case 'sm':
      return 24;
    case 'md':
      return 40;
  }
};

const getSizeClass = (size: TokenSize) => {
  switch (size) {
    case 'sm':
      return 'min-w-[24px] min-h-[24px]';
    case 'md':
      return 'min-w-[40px] min-h-[40px]';
  }
};

const getBackgroundColor = (chain: LiquidStakingChain) => {
  switch (chain) {
    case LiquidStakingChain.Manta:
      return 'bg-[#13101D] dark:bg-[#13101D]';
    case LiquidStakingChain.Moonbeam:
      return 'bg-[#1d1336] dark:bg-[#1d1336]';
    case LiquidStakingChain.Polkadot:
    default:
      return 'bg-mono-0 dark:bg-mono-0';
  }
};

const TokenLogo: FC<TokenLogoProps> = ({
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

export default TokenLogo;
