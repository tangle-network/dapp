import { FC } from 'react';
import { HiddenValueProps } from './types';
import { useHiddenValue } from '../../hooks';

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
