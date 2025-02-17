import { FC } from '../../../../../node_modules/react';
import { BridgeFeeDetailsProps } from './types';
/**
 * The BridgeFeeDetails component is used to display fees for a transaction.
 *
 * Props:
 * - `bridgeFeeInfo`: The info to show in the tooltip
 * - `gasFee`: The gas fee
 * - `gasFeeInfo`: The info to show in the tooltip for the gas fee
 * - `gasFeeInUSD`: The gas fee in USD
 * - `gasFeeToken`: The token of the gas fee
 * - `relayerFee`: The relayer fee
 * - `relayerFeeInfo`: The info to show in the tooltip for the relayer fee
 * - `relayerFeeInUSD`: The relayer fee in USD
 * - `relayerFeePercentage`: The relayer fee percentage
 * - `relayerFeeToken`: The token of the relayer fee
 *
 * @example
 *
 * ```jsx
 * <BridgeFeeDetails />
 * ```
 */
declare const BridgeFeeDetails: FC<BridgeFeeDetailsProps>;
export default BridgeFeeDetails;
