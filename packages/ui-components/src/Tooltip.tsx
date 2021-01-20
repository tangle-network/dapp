import React, { FC } from 'react';

import AntTooltip, { TooltipProps as AntTooltipProps } from 'antd/lib/tooltip';

import { Condition } from './Condition';
import './Tooltip.scss';

export type TooltipProps = AntTooltipProps & {
  show?: boolean;
}

export const Tooltip: FC<TooltipProps> = ({ children, show = true, ...other }) => {
  return (
    <Condition
      condition={show}
      or={children}
    >
      <AntTooltip
        autoAdjustOverflow
        destroyTooltipOnHide={{ keepParent: false }}
        overlayClassName='aca-tooltip'
        {...other}
      >
        {children}
      </AntTooltip>
    </Condition>
  );
};
