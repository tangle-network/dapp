import { FC, useMemo } from 'react';
import FeeDetails from '../../components/FeeDetails';
import { FeeItem } from '../../components/FeeDetails/types';
import { BridgeFeeDetailsProps } from './types';
import { GasStationFill } from '@webb-tools/icons';

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
const BridgeFeeDetails: FC<BridgeFeeDetailsProps> = ({
  bridgeFeeInfo,
  gasFee,
  gasFeeInfo,
  gasFeeInUSD,
  gasFeeToken,
  relayerFee,
  relayerFeeInfo,
  relayerFeeInUSD,
  relayerFeePercentage,
  relayerFeeToken,
}) => {
  const totalFee = useMemo(() => {
    if (gasFee && relayerFee) {
      return gasFee + relayerFee;
    }

    if (gasFee) {
      return gasFee;
    }

    return undefined;
  }, [gasFee, relayerFee]);

  const totalFeeToken = useMemo(() => {
    if (gasFeeToken && relayerFeeToken) {
      return relayerFeeToken;
    }

    if (gasFeeToken) {
      return gasFeeToken;
    }

    return undefined;
  }, [gasFeeToken, relayerFeeToken]);

  const feeItems = useMemo<FeeItem[]>(() => {
    const items: FeeItem[] = [
      {
        name: 'Gas',
        Icon: <GasStationFill />,
        info: gasFeeInfo,
        value: gasFee,
        tokenSymbol: gasFeeToken,
        valueInUsd: gasFeeInUSD,
      },
    ];

    if (relayerFee) {
      items.push({
        name: `Relayer Fee ${
          typeof relayerFeePercentage === 'number'
            ? `(${relayerFeePercentage}%)`
            : ''
        }`.trim(),
        info: relayerFeeInfo,
        value: relayerFee,
        tokenSymbol: relayerFeeToken,
        valueInUsd: relayerFeeInUSD,
      });
    }

    return items;
  }, [
    gasFeeInfo,
    gasFee,
    gasFeeToken,
    gasFeeInUSD,
    relayerFee,
    relayerFeePercentage,
    relayerFeeInfo,
    relayerFeeToken,
    relayerFeeInUSD,
  ]);

  return (
    <FeeDetails
      info={bridgeFeeInfo}
      totalFee={totalFee}
      totalFeeToken={totalFeeToken}
      items={feeItems}
    />
  );
};

export default BridgeFeeDetails;
