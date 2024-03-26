'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import useNetworkStore from '../../../context/useNetworkStore';

const TotalRestaked: FC<{ totalRestaked: number }> = ({ totalRestaked }) => {
  const { nativeTokenSymbol } = useNetworkStore();

  return (
    <Typography variant="h4" fw="bold" className="whitespace-nowrap">
      {totalRestaked} {nativeTokenSymbol}
    </Typography>
  );
};

export default TotalRestaked;
