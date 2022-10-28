import { WebbComponentBase } from '../../types';

export type ThresholdType = 'current' | 'next';

/**
 * Network threshold data for `NetworkThresholdsCard` component
 */
export interface NetworkThresholdsCardDataProps {
  /**
   * The card title
   */
  title: string;
  /**
   * The card title info (appears on the tooltip)
   */
  titleInfo?: string;
  /**
   * Keygen threshold value
   */
  keygenThreshold: number;
  /**
   * Signature threshold value
   */
  signatureThreshold: number;
  /**
   * The start time of the threshold
   */
  startTime: Date | string;
  /**
   * The end time of the threshold
   */
  endTime: Date | string;
  /**
   * The threshold type (can be `"current"` or `"next"`)
   */
  thresholdType: ThresholdType;
  /**
   * The session number
   */
  sessionNumber: number;
  /**
   * The hex key hash value
   */
  keyValue: string;
  /**
   * View full history url
   */
  viewHistoryUrl: string;
}

export interface NetworkThresholdsCardProps
  extends Omit<WebbComponentBase, keyof NetworkThresholdsCardDataProps>,
    NetworkThresholdsCardDataProps {}
