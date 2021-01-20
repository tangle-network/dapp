import React, { FC, useMemo } from 'react';
import { FormatNumber, FormatNumberProps } from './FormatNumber';
import { Fixed18 } from '@acala-network/app-util';
import { FixedPointNumber } from '@acala-network/sdk-core';

const FormatRatioConfig: FormatNumberProps['formatNumberConfig'] = {
  decimalLength: 6,
  removeEmptyDecimalParts: true,
  removeTailZero: true
};

export const FormatRatio: FC<FormatNumberProps> = ({ data, ...props }) => {
  const _data = useMemo(() => {
    if (data instanceof Fixed18) {
      return data.mul(Fixed18.fromNatural(100));
    }

    if (data instanceof FixedPointNumber) {
      return data.times(new FixedPointNumber(100));
    }

    return (new FixedPointNumber(100)).times(new FixedPointNumber(100));
  }, [data]);

  return (
    <FormatNumber
      data={_data}
      formatNumberConfig={FormatRatioConfig}
      suffix='%'
      {...props}
    />
  );
};
