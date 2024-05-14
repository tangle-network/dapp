import { IconBase } from '@webb-tools/icons/types.js';
import { TitleWithInfo } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types/index.js';
import { ComponentProps } from 'react';

export interface TxInfoItemProps extends PropsOf<'div'> {
  /**
   * The props of TitleWithInfo component to render
   * the title with tooltip info.
   */
  leftContent: ComponentProps<typeof TitleWithInfo>;

  /**
   * The right icon of the item.
   */
  rightIcon?: React.ReactElement<IconBase>;

  /**
   * The right text to display.
   */
  rightText: string;
}
