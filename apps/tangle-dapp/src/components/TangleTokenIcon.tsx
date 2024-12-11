import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import { IconSize } from '@webb-tools/icons/types';
import { FC } from 'react';

interface TangleTokenIconProps {
  size: IconSize;
}

const TangleTokenIcon: FC<TangleTokenIconProps> = ({ size }) => {
  return <TokenIcon name="tnt" size={size} />;
};

export default TangleTokenIcon;
