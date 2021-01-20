import React, { FC } from 'react';

import { FormatNumberProps, FormatNumber } from './FormatNumber';

export const FormatFixed18: FC<FormatNumberProps> = (props) => {
  return (
    <FormatNumber
      {...props}
    />
  );
};
