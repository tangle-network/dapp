import { SideBarExtraItemProps, SideBarItemProps } from './types';
type Props = SideBarItemProps & SideBarExtraItemProps;
declare function useLinkProps(args: Pick<Props, 'isInternal' | 'href' | 'isDisabled' | 'onClick'> & {
    hasSubItem?: boolean;
}): {
    readonly href?: undefined;
    readonly target?: undefined;
    readonly onClick?: undefined;
    readonly to?: undefined;
    readonly isInternal?: undefined;
} | {
    readonly href: string;
    readonly target: "_blank";
    readonly onClick: import('../../../../../node_modules/react').MouseEventHandler<HTMLAnchorElement> | undefined;
    readonly to?: undefined;
    readonly isInternal?: undefined;
} | {
    readonly to: string;
    readonly isInternal: true;
    readonly onClick: import('../../../../../node_modules/react').MouseEventHandler<HTMLAnchorElement> | undefined;
    readonly href?: undefined;
    readonly target?: undefined;
};
export default useLinkProps;
