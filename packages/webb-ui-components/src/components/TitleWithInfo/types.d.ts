import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

/**
 * The `TiltieWithInfo` component props
 */
export interface TitleWithInfoProps extends WebbComponentBase {
  /**
   * The `title` to be displayed
   */
  title: string;
  /**
   * The `info` appears inside the tooltip to describe the title
   */
  info?: string;
}
