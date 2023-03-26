import { WebbComponentBase } from '../../types';

/**
 * `MenuItem` component's props
 */
export interface MenuItemProps extends WebbComponentBase {
  /**
   * The icon displayed before the text
   */
  startIcon?: React.ReactElement;

  /**
   * The icon displayed after the text
   */
  icon?: React.ReactElement;

  /**
   * The text transform
   * @default 'capitalize'
   */
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'normal-case';
}
