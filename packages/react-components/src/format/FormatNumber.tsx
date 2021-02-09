import { Tooltip, TooltipProps } from '@webb-dapp/ui-components';
import { BareProps } from '@webb-dapp/ui-components/types';
import { Fixed18 } from '@webb-tools/app-util';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import clsx from 'clsx';
import React, { FC, useMemo } from 'react';

import { formatNumber, FormatNumberConfig } from '../utils';
import classes from './format.module.scss';

export type FormatterColor = 'primary' | 'error' | 'success';

export type FormatNumberProps = {
  data: number | string | Fixed18 | FixedPointNumber | undefined;
  formatNumberConfig?: FormatNumberConfig;
  withTooltips?: boolean;
  toolTipsProps?: Omit<TooltipProps, 'show'>;

  prefix?: string;
  suffix?: string;
  color?: FormatterColor;
} & BareProps;

export const FormatNumber: FC<FormatNumberProps> = ({
  className,
  color,
  data,
  formatNumberConfig,
  prefix = '',
  suffix = '',
  toolTipsProps,
  withTooltips = false,
}) => {
  const [i, d] = useMemo(() => {
    return formatNumber(data, formatNumberConfig).split('.');
  }, [data, formatNumberConfig]);

  return (
    <Tooltip show={withTooltips} title={data instanceof Fixed18 ? data.toString(18, 2) : data} {...toolTipsProps}>
      <span className={clsx(classes.number, className, color)}>
        {prefix ? <span>{prefix}</span> : null}
        {i ? <span>{i}</span> : null}
        {d ? <span className={classes.decimal}>.{d}</span> : null}
        {suffix && i !== 'N/A' ? <span>{suffix}</span> : null}
      </span>
    </Tooltip>
  );
};
