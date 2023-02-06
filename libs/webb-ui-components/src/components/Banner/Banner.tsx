import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../Button';
import { BannerPropsType } from './types';
import { BlockIcon, Close, GraphIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';

/**
 * The `Banner` component
 *
 * - `onClose`: Callback function when the close icon is clicked - this will close the banner
 * - `dappName`: The type of dapp that banner is being displayed for - `bridge` or `stats`
 * - `bannerText`: The text to display on the banner
 * - `buttonProps`: `Optional`. The button props to pass into the Button component
 * - `buttonText`: `Optional`. The text to display on the button
 * - `buttonClassName`: `Optional`. The class name to pass into the button
 *
 * ```jsx
      <Banner dappName='bridge' bannerText='Hubble Bridge is in beta version.' buttonText='Report Bug' onClose={onCloseHandler}>
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
      children,
      className: bannerClassNameProp,
      dappName,
      bannerText,
    } = props;

    const bannerBaseClx = useMemo(
      () =>
        'flex justify-between w-full items-center px-7 bg-blue-10 dark:bg-blue-120 h-[60px]',
      []
    );
    const bannerClassName = useMemo(
      () => twMerge(bannerBaseClx, bannerClassNameProp),
      [bannerBaseClx, bannerClassNameProp]
    );

    const buttonBaseClx = useMemo(
      () =>
        'ml-2 py-2 px-3 rounded-lg uppercase bg-mono-0 text-blue-70 dark:text-blue-120 hover:bg-mono-10',
      []
    );
    const buttonClassName = useMemo(
      () => twMerge(buttonBaseClx, buttonClassNameProp),
      [buttonBaseClx, buttonClassNameProp]
    );

    return (
      <div className={bannerClassName} ref={ref}>
        <span />
        <span className="flex items-center">
          {dappName === 'bridge' ? (
            <span className="mr-2">
              <BlockIcon
                size="lg"
                className="stroke-blue-70 dark:stroke-mono-0"
              />
            </span>
          ) : dappName === 'stats' ? (
            <span className="mr-2">
              <GraphIcon size="lg" className="fill-blue-70 dark:fill-mono-0" />
            </span>
          ) : null}

          <Typography
            variant="body1"
            fw="bold"
            className="text-blue-70 dark:text-mono-0"
          >
            {bannerText}
          </Typography>

          {buttonText && (
            <Button {...buttonProps} className={buttonClassName}>
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
