import { PropsOf, IWebbComponentBase } from '../../types';

/**
 * The `Tabs` props
 */
export interface TabsProps extends IWebbComponentBase {
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
export interface TabProps extends PropsOf<'button'>, IWebbComponentBase {
  /**
   * If `true`, indicate the tab is being actived
   */
  isActive?: boolean;
}
