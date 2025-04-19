import { ReactNode } from 'react';
import { PropsOf, IComponentBase } from '../../types';

import { TitleWithInfoProps } from '../TitleWithInfo/types';

export interface StatItem {
  titleProps: TitleWithInfoProps;
  value: string | number;
}

export interface StatsProps extends PropsOf<'div'>, IComponentBase {
  items: Array<StatItem>;
}

export type StatsItemProps = {
  title: string | ReactNode;
  tooltip?: string | ReactNode;
  className?: string;
  children: ReactNode | null;
  isError?: boolean;
};

export type KeyStatsItemProps = {
  title: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  className?: string;
  showDataBeforeLoading?: boolean;
  hideErrorNotification?: boolean;
  children?: ReactNode;
  error: Error | null;
  isLoading?: boolean;
  variant?: KeyStatsItemVariant;
};

export enum KeyStatsItemVariant {
  Left,
  Center,
  Right,
}
