import './Button.scss';

import clsx from 'clsx';
import React, { FC } from 'react';

import { getIcon, IconType } from './Icon';
import { BareProps } from './types';

type ButtonType = 'normal' | 'ghost' | 'border';
type ButtonStyle = 'normal' | 'primary' | 'danger';
type ButtonSize = 'small' | 'middle' | 'large';

export interface ButtonProps extends BareProps {
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: ButtonType;
  style?: ButtonStyle;
  size?: ButtonSize;
}

export const Button: FC<ButtonProps> = ({
  children,
  className,
  disabled,
  loading,
  onClick,
  size = 'middle',
  style = 'primary',
  type = 'normal',
}) => {
  const _onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    // handle disabled/loading status
    if (disabled || loading) {
      return;
    }

    onClick && onClick(event);
  };

  return (
    <button
      className={clsx(className, 'aca-btn', `aca-btn--${size}`, `aca-btn--${type}`, `aca-btn-style--${style}`, {
        'aca-btn--loading': loading,
        disabled: disabled,
      })}
      onClick={_onClick}
    >
      {children}
    </button>
  );
};

interface IconButtonProps extends ButtonProps {
  icon: IconType;
}

export const IconButton: FC<IconButtonProps> = ({ className, icon, ...other }) => {
  return (
    <Button className={clsx(className, 'aca-icon-btn')} {...other}>
      {getIcon(icon)}
    </Button>
  );
};
