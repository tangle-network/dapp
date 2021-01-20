import React, { FC } from 'react';
import { useApi } from '@webb-dapp/react-hooks';

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

interface BlockTime {
  block: number;
  to: 'hour' | 'week' | 'day';
}

export const FormatBlockTime: FC<BlockTime> = ({ block, to }) => {
  const { api } = useApi();

  const blockTime = api.consts.babe.expectedBlockTime.toNumber();

  if (to === 'hour') {
    return <span>{(block * blockTime) / HOUR + ' Hour'}</span>;
  }

  if (to === 'day') {
    return <span>{(block * blockTime) / DAY + ' Hour'}</span>;
  }

  if (to === 'week') {
    return <span>{(block * blockTime) / WEEK + ' Week'}</span>;
  }

  return null;
};
