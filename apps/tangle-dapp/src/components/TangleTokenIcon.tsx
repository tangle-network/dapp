import TangleTokenLogo from '@webb-tools/icons/tokens/tnt.svg?url';
import { IconSize } from '@webb-tools/icons/types';
import { FC } from 'react';

interface TangleTokenIconProps {
  size: IconSize;
  className?: string;
}

const TangleTokenIcon: FC<TangleTokenIconProps> = ({ size, className }) => {
  const sizeInPx = getIconSize(size);

  return (
    <img
      src={TangleTokenLogo}
      alt="Tangle Token Icon"
      width={sizeInPx}
      height={sizeInPx}
      className={className}
      loading="lazy"
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
