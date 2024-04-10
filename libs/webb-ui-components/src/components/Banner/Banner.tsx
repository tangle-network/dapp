import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../buttons';
import { BannerPropsType } from './types';
import { Close } from '@webb-tools/icons';
import { Typography } from '../../typography';

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
export const Banner = React.forwardRef<HTMLDivElement, BannerPropsType>(
  (props, ref) => {
    const {
      onClose,
      buttonText,
      buttonProps,
      buttonClassName: buttonClassNameProp,
      className: bannerClassNameProp,
      Icon,
      bannerText,
    } = props;

    const bannerBaseClx = useMemo(
      () =>
        'flex justify-between gap-2 w-full items-center px-7 py-2 bg-blue-10 dark:bg-blue-120',
      []
    );
    const bannerClassName = useMemo(
      () => twMerge(bannerBaseClx, bannerClassNameProp),
      [bannerBaseClx, bannerClassNameProp]
    );

    const buttonBaseClx = useMemo(
      () =>
        'ml-2 py-2 px-3 rounded-lg uppercase bg-mono-0 dark:bg-mono-0 text-blue-70 dark:text-blue-120 hover:bg-mono-0 hover:dark:bg-mono-0 border-none',
      []
    );
    const buttonClassName = useMemo(
      () => twMerge(buttonBaseClx, buttonClassNameProp),
      [buttonBaseClx, buttonClassNameProp]
    );

    return (
      <div className={bannerClassName} ref={ref}>
        <span />
        <span className="flex items-center gap-2">
          <span>
            <Icon size="lg" className="fill-blue-70 dark:fill-mono-0" />
          </span>

          <Typography
            variant="body1"
            fw="bold"
            className="text-blue-70 dark:text-mono-0"
          >
            {bannerText}
          </Typography>

          {buttonText && (
            <Button
              {...buttonProps}
              variant="utility"
              size="sm"
              className={buttonClassName}
            >
              {buttonText}
            </Button>
          )}
        </span>
        <span onClick={onClose} className="cursor-pointer">
          <Close size="lg" className="fill-blue-70 dark:fill-mono-0" />
        </span>
      </div>
    );
  }
);
