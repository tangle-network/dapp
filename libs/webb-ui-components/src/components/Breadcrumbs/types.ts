import { WebbComponentBase } from '../../types';

export interface BreadcrumbsPropsType extends WebbComponentBase {
  separator?: string | React.ReactNode;
}

export interface BreadcrumbsItemPropsType extends WebbComponentBase {
  path?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsSeparatorPropsType extends WebbComponentBase {}
