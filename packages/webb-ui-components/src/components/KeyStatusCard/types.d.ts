import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export type KeyType = 'current' | 'next';

/**
 * Properties of an authority
 */
export type Authority = {
  /**
   * The authority id
   */
  id: string;
  /**
   * The authority avatar url
   */
  avatarUrl: string;
};

/**
 * Authorities object
 */
export type AuthoritiesType = {
  /**
   * Key will be the authority id and the value if `Authority` type
   * @type {Authority}
   */
  [id: string]: Authority;
};

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
   * @type {AuthoritiesType}
   */
  authorities: AuthoritiesType;
  /**
   * Total number of authorities
   */
  totalAuthorities: number;
  /**
   * The `url` to the detail page of the key
   */
  fullDetailUrl: string;
}

/**
 * The `KeyStatusCard` component props type
 */
export interface KeyStatusCardProps
  extends Omit<WebbComponentBase, keyof KeyStatusCardDataProps>,
    KeyStatusCardDataProps {}
