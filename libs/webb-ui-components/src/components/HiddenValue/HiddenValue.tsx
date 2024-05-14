import { FC } from 'react';
import { HiddenValueProps } from './types.js';
import { useHiddenValue } from '../../hooks/index.js';

export const HiddenValue: FC<HiddenValueProps> = ({
  numberOfStars,
  children,
}) => {
  const [isHidden] = useHiddenValue();

  if (isHidden) {
    return Array.from({ length: numberOfStars ?? children.length })
      .map(() => '*')
      .join('');
  }

  return children;
};
