import { InfoItemProps } from './types';
/**
 * The `InfoItem` component
 *
 * Props:
 *
 * - `leftTextProps`: The left text props (props of TitleWithInfo component)
 * - `rightContent`: Right-sided content
 *
 * @example
 *
 * ```jsx
 *   <InfoItem
 *     leftTextProps={{
 *      title: 'Depositing',
 *      variant: 'utility',
 *      info: 'Depositing',
 *     }}
 *    rightContent={amount}
 *  />
 * ```
 */
export declare const InfoItem: import('../../../../../node_modules/react').ForwardRefExoticComponent<InfoItemProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
