import { BannerPropsType } from './types';
/**
 * The `Banner` component
 *
 * - `onClose`: Callback function when the close icon is clicked - this will close the banner
 * - `Icon`: The icon to be displayed on the left side of the banner
 * - `bannerText`: The text to display on the banner
 * - `buttonProps`: `Optional`. The button props to pass into the Button component
 * - `buttonText`: `Optional`. The text to display on the button
 * - `buttonClassName`: `Optional`. The class name to pass into the button
 *
 * ```jsx
      <Banner Icon={Box1Line} bannerText='Hubble Bridge is in beta version.' buttonText='Report Bug' onClose={onCloseHandler}>
  </Banner>
 * ```
 */
export declare const Banner: import('../../../../../node_modules/react').ForwardRefExoticComponent<BannerPropsType & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
