import { TokenIcon } from '@tangle-network/icons/TokenIcon';
import { IconSize } from '@tangle-network/icons/types';
import { FC } from 'react';

interface TangleTokenIconProps {
  size: IconSize;
}

const TangleTokenIcon: FC<TangleTokenIconProps> = ({ size }) => {
  return <TokenIcon name="tnt" size={size} />;
};

export default TangleTokenIcon;
