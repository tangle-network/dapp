import React, { ReactNode } from 'react';

import { ReactComponent as CopyIcon } from './assets/copy.svg';
import { ReactComponent as SwapIcon } from './assets/swap.svg';
import { ReactComponent as EditIcon } from './assets/edit.svg';
import { ReactComponent as CloseIcon } from './assets/close.svg';
import { ReactComponent as ArrowIcon } from './assets/arrow-down.svg';
import { ReactComponent as CheckedCircleIcon } from './assets/checked-circle.svg';
import { ReactComponent as SwitchIcon } from './assets/switch.svg';
import { ReactComponent as ArrowPixelIcon } from './assets/arrow-pixel.svg';

export * from '@ant-design/icons';

export {
  ArrowIcon,
  CopyIcon,
  CloseIcon,
  CheckedCircleIcon,
  EditIcon,
  SwapIcon,
  SwitchIcon,
  ArrowPixelIcon
};

export type IconType = 'copy' | 'swap' | 'edit' | 'close';

export const getIcon = (name: IconType): ReactNode => {
  if (name === 'copy') {
    return <CopyIcon title='copy' />;
  }

  if (name === 'swap') {
    return <SwapIcon title='swap' />;
  }

  if (name === 'edit') {
    return <EditIcon title='edit' />;
  }

  if (name === 'close') {
    return <CloseIcon title='close' />;
  }
};
