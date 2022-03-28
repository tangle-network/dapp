import React, { ReactNode } from 'react';

import * as ArrowPixelIcon from './assets/arrow-pixel.svg';
import * as CheckedCircleIcon from './assets/checked-circle.svg';
import * as CloseIcon from './assets/close.svg';
import * as CopyIcon from './assets/copy.svg';
import * as EditIcon from './assets/edit.svg';
import * as SwapIcon from './assets/swap.svg';
import * as SwitchIcon from './assets/switch.svg';

export { CopyIcon, CloseIcon, CheckedCircleIcon, EditIcon, SwapIcon, SwitchIcon, ArrowPixelIcon };

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
