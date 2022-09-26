import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

/**
 * The `Tabs` props
 */
export interface TabsProps extends PropsOf<'div'>, WebbComponentBase {
  /**
   * The displayed values of tabs
   */
  value: string[];
  /**
   * The callback to control the component
   */
  onChange?: (nextValue: string) => void;
}

/**
 * The `Tab` props
 */
export interface TabProps extends PropsOf<'button'>, WebbComponentBase {
  /**
   * If `true`, indicate the tab is being actived
   */
  isActive?: boolean;
}
