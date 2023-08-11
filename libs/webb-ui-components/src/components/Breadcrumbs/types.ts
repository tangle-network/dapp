import { WebbComponentBase } from '../../types';

export interface BreadcrumbsPropsType extends WebbComponentBase {
  separator?: string | React.ReactNode;
}

export interface BreadcrumbsItemPropsType extends WebbComponentBase {
  isLast?: boolean;
  icon?: React.ReactNode;
  textClassName?: string;
}

export interface BreadcrumbsSeparatorPropsType extends WebbComponentBase {}
