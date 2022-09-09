import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export type KeyValueWithButtonSize = 'sm' | 'md';

/**
 * The `KeyValueWithButton` props
 */
export interface KeyValueWithButtonProps extends WebbComponentBase {
  /**
   * The `key` hash value
   */
  keyValue: string;
  /**
   * The component size
   * @default "md"
   */
  size?: 'sm' | 'md';
}
