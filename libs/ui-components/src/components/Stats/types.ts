import { PropsOf, IWebbComponentBase } from '../../types';

import { TitleWithInfoProps } from '../TitleWithInfo/types';

export interface StatItem {
  titleProps: TitleWithInfoProps;
  value: string | number;
}

export interface StatsProps extends PropsOf<'div'>, IWebbComponentBase {
  items: Array<StatItem>;
}
