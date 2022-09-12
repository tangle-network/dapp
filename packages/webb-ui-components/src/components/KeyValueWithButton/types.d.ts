import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';
import { WebbTypographyVariant } from '@webb-dapp/webb-ui-components/typography/types';

import { LabelWithValueProps } from '../LabelWithValue/types';

export type KeyValueWithButtonSize = 'sm' | 'md';

/**
 * The `KeyValueWithButton` props
 */
export interface KeyValueWithButtonProps
  extends WebbComponentBase,
    Pick<LabelWithValueProps, 'valueVariant' | 'labelVariant'> {
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
