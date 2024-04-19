import TangleTokenLogo from '@webb-tools/icons/tokens/tnt.svg';
import { IconSize } from '@webb-tools/icons/types';
import Image from 'next/image';
import { FC } from 'react';

interface TangleTokenIconProps {
  size: IconSize;
}

const TangleTokenIcon: FC<TangleTokenIconProps> = ({ size: size }) => {
  const sizeInPx = getIconSize(size);

  return (
    <Image
      src={TangleTokenLogo}
      alt="Tangle Token Icon"
      width={sizeInPx}
      height={sizeInPx}
    />
  );
};

export default TangleTokenIcon;

/* @internal */
function getIconSize(size: IconSize) {
  switch (size) {
    case 'xl': {
      return 48;
    }

    case 'lg': {
      return 24;
    }

    case 'md': {
      return 16;
    }

    default: {
      throw new Error('Unknown icon size');
    }
  }
}
