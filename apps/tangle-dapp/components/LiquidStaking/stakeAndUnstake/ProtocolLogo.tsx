import Image from 'next/image';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  getLsProtocolDef,
  LsProtocolId,
} from '../../../constants/liquidStaking/types';

export type ProtocolLogoSize = 'sm' | 'md';

export type ProtocolLogoProps = {
  protocolId?: LsProtocolId;
  size: ProtocolLogoSize;
  isRounded?: boolean;
  isLiquidVariant?: boolean;
};

const getSizeNumber = (size: ProtocolLogoSize) => {
  switch (size) {
    case 'sm':
      return 24;
    case 'md':
      return 40;
  }
};

const getSizeClass = (size: ProtocolLogoSize) => {
  switch (size) {
    case 'sm':
      return 'min-w-[24px] min-h-[24px]';
    case 'md':
      return 'min-w-[40px] min-h-[40px]';
  }
};

const getBackgroundColor = (protocolId: LsProtocolId) => {
  switch (protocolId) {
    case LsProtocolId.MANTA:
      return 'bg-[#13101D] dark:bg-[#13101D]';
    case LsProtocolId.MOONBEAM:
      return 'bg-[#1d1336] dark:bg-[#1d1336]';
    case LsProtocolId.PHALA:
      return 'bg-black dark:bg-black';
    case LsProtocolId.POLKADOT:
      return 'bg-mono-0 dark:bg-mono-0';
    case LsProtocolId.TANGLE_RESTAKING_PARACHAIN:
      // Fix the icon SVG getting cut off on the sides by adding
      // a matching background.
      return 'bg-[#f6f4ff]';
    case LsProtocolId.ASTAR:
      // No background for Astar, since it looks better without
      // a background.
      return '';
  }
};

const ProtocolLogo: FC<ProtocolLogoProps> = ({
  protocolId,
  size = 'md',
  isRounded = false,
  isLiquidVariant = false,
}) => {
  const sizeNumber = getSizeNumber(size);

  // In case the chain id is not provided, render a placeholder.
  if (protocolId === undefined) {
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
          getBackgroundColor(protocolId),
          isRounded ? 'rounded-full' : 'rounded-md',
        )}
        src={getLsProtocolDef(protocolId).logo}
        alt={`Logo of the liquid staking token ${protocolId}`}
        width={sizeNumber}
        height={sizeNumber}
      />
    </div>
  );
};

export default ProtocolLogo;
