/**
 * FeeDetails component is used to display fees for a transaction.
 * Note: This is the base component for UI displaying.
 * Refer to `containers/BridgeFeeDetails` for a more specific implementation for the Hubble Bridge.
 *
 * Props:
 * - `info`: The info to show in the tooltip
 * - `totalFee`: The total fee
 * - `totalFeeToken`: The token of the total fee
 * - `totalFeeCmp`: The total fee component
 * - `items`: The list of fee items
 *
 * @example
 *
 * ```jsx
 *  <FeeDetails
 *    info="This is the fee"
 *    totalFee={100}
 *    totalFeeToken="tnt"
 *    items={[
 *      {
 *        name: 'Gas',
 *        Icon: <GasStationFill />,
 *        info: 'This is the gas fee',
 *        value: 100,
 *        tokenSymbol: 'tnt',
 *        valueInUsd: 100,
 *     },
 *    ]}
 *  />
 * ```
 */
declare const FeeDetails: import('../../../../../node_modules/react').ForwardRefExoticComponent<Omit<import('@radix-ui/react-accordion').AccordionSingleProps, "type"> & {
    title?: string;
    titleClassName?: string;
    itemTitleClassName?: string;
    info?: import('../TitleWithInfo/types').TitleWithInfoProps["info"];
    totalFee?: number;
    totalFeeToken?: string;
    totalFeeCmp?: React.ReactNode;
    isTotalLoading?: boolean;
    items?: Array<import('./types').FeeItem>;
    isDefaultOpen?: boolean;
    isDisabledBgColor?: boolean;
} & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
export default FeeDetails;
