import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

import { LabelWithValueProps } from '../LabelWithValue/types';

export type KeyValueWithButtonSize = 'sm' | 'md';

export interface KeyValueWithButtonBaseProps extends Pick<LabelWithValueProps, 'isHiddenLabel'> {}

/**
 * The `KeyValueWithButton` props
 */
export interface KeyValueWithButtonProps
  extends Omit<WebbComponentBase, keyof KeyValueWithButtonBaseProps>,
    KeyValueWithButtonBaseProps {
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
