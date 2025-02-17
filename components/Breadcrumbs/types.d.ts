import { ComponentBase } from '../../types';
export interface BreadcrumbsPropsType extends ComponentBase {
    separator?: string | React.ReactNode;
}
export interface BreadcrumbsItemPropsType extends ComponentBase {
    isLast?: boolean;
    icon?: React.ReactNode;
    textClassName?: string;
}
export interface BreadcrumbsSeparatorPropsType extends ComponentBase {
}
