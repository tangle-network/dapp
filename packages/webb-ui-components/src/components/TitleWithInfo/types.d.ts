import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';
import { WebbTypographyProps, WebbTypographyVariant } from '@webb-dapp/webb-ui-components/typography/types';

/**
 * The `TiltieWithInfo` component props
 */
export interface TitleWithInfoProps extends WebbComponentBase {
  /**
   * The `title` to be displayed
   */
  title: string;
  /**
   * The `title` variant
   * @default "body1"
   */
  variant?: WebbTypographyVariant;
  /**
   * The title tab
   * @default <span></span>
   */
  titleComponent?: WebbTypographyProps['component'];
  /**
   * If `true`, the title will inherit the color from its parent
   */
  inheritColor?: boolean;
  /**
   * The `info` appears inside the tooltip to describe the title
   */
  info?: string;
}
