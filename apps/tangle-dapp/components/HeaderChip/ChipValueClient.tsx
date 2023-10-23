'use client';

import getRoundedDownNumberWith2Decimals from '../../utils/getRoundedDownNumberWith2Decimals';
import dataHooks from './dataHooks';
import { ChipType } from './types';

export default function ChipValueClient(props: {
  type: ChipType;
  value?: number;
}) {
  const era = dataHooks[props.type](props.value);

  return <>{getRoundedDownNumberWith2Decimals(era)}</>;
}
