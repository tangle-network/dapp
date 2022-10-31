import { ISubQlTime, WebbComponentBase } from '../../types';

export type KeyType = 'current' | 'next';

/**
 * The data props for display
 */
export interface KeyStatusCardDataProps {
  /**
   * The key card title (can be `Active key` or `Next key`)
   */
  title: string;
  /**
   * The title info describes the card (appears in the `Tooltip`)
   */
  titleInfo?: string;
  /**
   * The session number next to the title
   */
  sessionNumber: number;
  /**
   * The `KeyType` (can be `current` or `next` )
   */
  keyType: KeyType;
  /**
   * The key value (hex string hash)
   */
  keyVal: string;
  /**
   * The start time of the `key`
   */
  startTime: Date | null;
  /**
   * The end time of the `key`
   */
  endTime: Date | null;
  /**
   * The `Authority` represents authorities attended in the key gen process
   * @type {Set<string>}
   */
  authorities: Set<string>;
  /**
   * Total number of authorities
   */
  totalAuthorities: number;
  /**
   * The `url` to the detail page of the key
   */
  fullDetailUrl: string;
  /**
   * The previous key id for nagivation
   */
  previousKeyId?: string;
  /**
   * The next key id for navigation
   */
  nextKeyId?: string;
  /**
   * Time instance
   * */
  instance: ISubQlTime;
}

/**
 * The `KeyStatusCard` component props type
 */
export interface KeyStatusCardProps
  extends Omit<WebbComponentBase, keyof KeyStatusCardDataProps>,
    KeyStatusCardDataProps {}
