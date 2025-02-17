import { FC } from '../../../../../node_modules/react';
import { LogoProps } from '../Logo/types';
import { MobileSidebarProps } from './types';
/**
 * Sidebar Navigation Menu Component
 *
 * - `Logo`: The logo of the sidebar
 * - `ClosedLogo`: The logo of the sidebar when it is closed
 * - `items`: The items of the sidebar menu (see type `ItemProps`)
 * - `footer`: The footer of the sidebar menu (see type `FooterProps`)
 *
 * ```jsx
 *  // Example
 *  <SideBar
 *    Logo={Logo}
 *    ClosedLogo={ClosedLogo}
 *    items={items}
 *    footer={footer}
 *  />
 * ```
 */
export declare const SideBar: import('../../../../../node_modules/react').ForwardRefExoticComponent<MobileSidebarProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
export declare const SidebarTangleClosedIcon: FC<LogoProps>;
