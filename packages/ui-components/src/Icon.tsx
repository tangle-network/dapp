// @ts-nocheck
import React, { ReactNode } from 'react';

import ArrowPixelIcon from './assets/arrow-pixel.svg';
import CheckedCircleIcon from './assets/checked-circle.svg';
import CloseIconSvg from './assets/close.svg';
import CopyIcon from './assets/copy.svg';
import EditIcon from './assets/edit.svg';
import SwapIcon from './assets/swap.svg';
import SwitchIcon from './assets/switch.svg';

export { CloseIconSvg, CopyIcon, CheckedCircleIcon, EditIcon, SwapIcon, SwitchIcon, ArrowPixelIcon };
export { default as CloseIcon } from './assets/CloseIcon';

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
    return <CloseIconSvg title='close' />;
  }
};
