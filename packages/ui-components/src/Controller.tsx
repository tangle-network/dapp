import './Controller.scss';

import clsx from 'clsx';
import React, { FC } from 'react';

import { ReactComponent as ArrowIcon } from './assets/arrow.svg';
import { Button } from './Button';
import { BareProps } from './types';

type Direction = 'left' | 'right';

export interface ControllerProps {
  direction: Direction;
  disabled?: boolean;
  onClick?: () => void;
}

export const _Controller: FC<ControllerProps> = ({ direction, disabled, onClick }) => {
  return (
    <Button className={clsx('aca-controller__root', direction, { disabled })} disabled={disabled} onClick={onClick}>
      <ArrowIcon />
    </Button>
  );
};

const Group: FC<BareProps> = ({ children, className }) => {
  return <div className={clsx('aca-controller__group', className)}>{children}</div>;
};

type ControllerType = FC<ControllerProps> & { Group: typeof Group };

const Controller = _Controller as ControllerType;

Controller.Group = Group;

export { Controller };
