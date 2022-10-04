import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

import { LabelWithValueProps } from '../LabelWithValue/types';

export type KeyValueWithButtonSize = 'sm' | 'md';

type KeyValueWithButtonBasePickedKeys = 'isHiddenLabel' | 'valueVariant' | 'labelVariant';

export interface KeyValueWithButtonBaseProps extends Pick<LabelWithValueProps, KeyValueWithButtonBasePickedKeys> {}

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
  /**
   * Whether format the value in the short form.
   * @default true
   */
  hasShortenValue?: boolean;
}
