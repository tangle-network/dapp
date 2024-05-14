import { PropsOf } from '@webb-tools/webb-ui-components/types/index.js';

export interface PageTabsContainerProps extends PropsOf<'div'> {
  /**
   * The type of the page
   */
  pageType: 'bridge' | 'wrapper';

  /**
   * The props of the setting button.
   */
  settingBtnProps?: PropsOf<'button'>;
}
