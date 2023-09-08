import { PropsOf } from '@webb-tools/webb-ui-components/types';

export interface BridgeTabsContainerProps extends PropsOf<'div'> {
  /**
   * The props of the setting button.
   */
  settingBtnProps?: PropsOf<'button'>;
}
