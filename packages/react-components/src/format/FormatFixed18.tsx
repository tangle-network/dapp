import React, { FC } from 'react';

import { FormatNumber, FormatNumberProps } from './FormatNumber';

export const FormatFixed18: FC<FormatNumberProps> = (props) => {
  return <FormatNumber {...props} />;
};
