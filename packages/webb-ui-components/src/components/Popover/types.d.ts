import { PopoverTriggerProps } from '@radix-ui/react-popover';
import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

/**
 * The `Popover` props
 */
export interface PopoverProps extends PropsOf<'div'>, WebbComponentBase {
  /**
   * The `Popover` size
   */
  size?: 'md' | 'sm';
  /**
   * The Button used as the popover trigger
   */
  icon?: React.ReactElement;
}

type PopoverButtonPickedKeys = 'icon' | 'size';

/**
 * The `PopoverButton` props
 */
export interface PopoverButtonProps
  extends PropsOf<'button'>,
    WebbComponentBase,
    Pick<PopoverProps, PopoverButtonPickedKeys> {}

type PopoverBodyPickedKeys = 'size';

/**
 * The `PopoverBody` props
 */
export interface PopoverBodyProps
  extends PropsOf<'div'>,
    WebbComponentBase,
    Pick<PopoverProps, PopoverBodyPickedKeys> {}
