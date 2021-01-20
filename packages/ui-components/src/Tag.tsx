import React, { FC } from 'react';
import clsx from 'clsx';

import { BareProps, Style } from './types';
import './Tag.scss';

type Type = 'normal' | 'flag';

export interface TagProps extends BareProps {
  style?: Style;
  type?: Type;
  onClick?: () => void;
}

export const Tag: FC<TagProps> = ({
  children,
  className,
  onClick,
  style = 'normal',
  type = 'normal'
}) => {
  return (
    <span
      className={
        clsx(
          'aca-tag',
          `aca-tag--style-${style}`,
          `aca-tag--type-${type}`,
          className,
          {
            'aca-tag--clickable': onClick
          }
        )
      }
      onClick={onClick}
    >
      {children}
    </span>
  );
};

export const TagGroup: FC<BareProps> = ({
  children,
  className
}) => {
  return (
    <div className={clsx('aca-tag__group', className)}>
      {children}
    </div>
  );
};
