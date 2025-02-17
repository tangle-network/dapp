import { BreadcrumbsItemPropsType } from './types';
/**
 * The `BreadcrumbsItem` component
 *
 * - `icon`: `Optional`. The icon to appear before the component's children
 * - `isLast`: `Optional`. If `true` the breadcrumb item will be highlighted indicating it's the last item
 *
 * ```jsx
 *  // Example (not a last item)
 *  <BreadcrumbsItem icon={<GridFillIcon />}>Tangle Explorer</BreadcrumbsItem>
 *
 *  // Example (is a last item)
 *  <BreadcrumbsItem icon={<GridFillIcon />} isLast>Tangle Explorer</BreadcrumbsItem>
 * ```
 */
export declare const BreadcrumbsItem: import('../../../../../node_modules/react').ForwardRefExoticComponent<BreadcrumbsItemPropsType & import('../../../../../node_modules/react').RefAttributes<HTMLSpanElement>>;
