import { BreadcrumbsPropsType } from './types';
/**
 * The `Breadcrumbs` component
 *
 * - `separator`: `Optional`. The separator between the breadcrumbs. Default is `/`
 *
 * ```jsx
 *  // Example
 *  <Breadcrumbs>
 *    <BreadcrumbsItem icon={<GridFillIcon />}>Tangle Explorer</BreadcrumbsItem>
 *    <BreadcrumbsItem icon={<KeyIcon />}>Keys Overview</BreadcrumbsItem>
 *    <BreadcrumbsItem icon={<ShieldKeyholeLineIcon />} isLast>Keygen details</BreadcrumbsItem>
 *  <Breadcrumbs />
 * ```
 */
export declare const Breadcrumbs: import('../../../../../node_modules/react').ForwardRefExoticComponent<BreadcrumbsPropsType & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
