import { PropsOf, IComponentBase } from '../../types';
import { TitleWithInfoProps } from '../TitleWithInfo/types';
export interface StatItem {
    titleProps: TitleWithInfoProps;
    value: string | number;
}
export interface StatsProps extends PropsOf<'div'>, IComponentBase {
    items: Array<StatItem>;
}
