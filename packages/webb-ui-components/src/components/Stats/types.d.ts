import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

import { TitleWithInfoProps } from '../TitleWithInfo/types';

export interface StatItem {
  titleProps: TitleWithInfoProps;
  value: string | number;
}

export interface StatsProps extends PropsOf<'div'>, WebbComponentBase {
  items: Array<StatItem>;
}
