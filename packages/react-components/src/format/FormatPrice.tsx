import React, { FC } from 'react';

import { FormatNumber, FormatNumberProps } from './FormatNumber';

const FormatPriceConfig: FormatNumberProps['formatNumberConfig'] = {
  decimalLength: 2,
  removeEmptyDecimalParts: true,
  removeTailZero: false
};

export const FormatPrice: FC<FormatNumberProps> = (props) => {
  return (
    <FormatNumber
      formatNumberConfig={FormatPriceConfig}
      prefix={'≈US $'}
      {...props}
    />
  );
};
