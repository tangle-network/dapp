import { TitleWithInfoProps } from '../../components/TitleWithInfo/types';

/**
 * The props of the BridgeFeeDetails container.
 */
export type BridgeFeeDetailsProps = {
  /**
   * The bridge fee tooltip info
   */
  bridgeFeeInfo?: TitleWithInfoProps['info'];

  /**
   * The formated gas fee
   */
  gasFee?: number;

  /**
   * The gas fee in USD
   */
  gasFeeInUSD?: number;

  /**
   * The gas fee token
   */
  gasFeeToken?: string;

  /**
   * The gas fee tooltip info
   */
  gasFeeInfo?: TitleWithInfoProps['info'];

  /**
   * The formated relayer fee
   */
  relayerFee?: number;

  /**
   * The relayer fee in USD
   */
  relayerFeeInUSD?: number;

  /**
   * The relayer fee percentage (0-100)
   */
  relayerFeePercentage?: number;

  /**
   * The relayer fee token
   */
  relayerFeeToken?: string;

  /**
   * The relayer fee tooltip info
   */
  relayerFeeInfo?: TitleWithInfoProps['info'];
};
