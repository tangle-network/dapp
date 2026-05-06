'use client';

import { Fragment, forwardRef, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { SOCIAL_URLS_RECORD } from '../../constants';
import { Typography } from '../../typography';
import { Button, ButtonProps } from '../buttons';
import { ErrorFallbackProps } from './types';

const contactLink = SOCIAL_URLS_RECORD.telegram;

const reportIssueLink =
  `${SOCIAL_URLS_RECORD.github}/dapp/issues/new/choose` as const;

/**
 * The `ErrorFallback` component, used to display an error message when an UI error occurs.
 *
 * - `title`: The error title to display (default is "Something went wrong")
 * - `description`: The error description to display, can be a string or a react element (string with links, etc.). When noWrapper is true, the children will be rendered without a wrapper (`<Typography />`)
 * - `buttons`: The button prop list for displaying the buttons in the error fallback component. if not provided, the default button will be rendered (refresh page and report issue)
 * - `contactUsLinkProps`: Contact us link props, for overriding the default props
 * - `refreshPageButtonProps`: Refresh page button props for overriding the default props
 * - `reportIssueButtonProps`: Report issue button props for overriding the default props
 *
 * ```jsx
 *  <ErrorFallback className='mr-3' />
 *  <ErrorFallback
 *    title='An error occurred'
 *    description='Please refresh the page or try again later.'
 *  />
 * ```
 */
export const ErrorFallback = forwardRef<HTMLDivElement, ErrorFallbackProps>(
  (
    {
      buttons,
      className,
      contactUsLinkProps,
      description: descriptionProp,
      refreshPageButtonProps,
      reportIssueButtonProps,
      title = 'Something went wrong',
      ...props
    },
    ref,
  ) => {
    const [hasClearedCache, setHasClearedCache] = useState(false);

    const description = useMemo(() => {
      if (descriptionProp) {
        return descriptionProp;
      }

      return [
        'Please either refresh the page or try again later.',
        {
          noWrapper: false,
          children: (
            <span className="inline-block w-9/12 mx-auto">
              If the issue persists, please{' '}
              <Button
                href={contactLink}
                target="_blank"
                {...contactUsLinkProps}
                variant="link"
                className="inline-block"
              >
                contact us
              </Button>{' '}
              or report the issue.
            </span>
          ),
        },
      ];
    }, [contactUsLinkProps, descriptionProp]);

    const handleClearCache = useCallback(() => {
      localStorage.clear();
      setHasClearedCache(true);
    }, []);

    const buttonProps = useMemo<Array<ButtonProps>>(() => {
      if (buttons) {
        return buttons;
      }

      const commonButtonProps = {
        className: 'px-3 py-2 rounded-lg',
        size: 'sm',
      } as const;

      return [
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onClick: () => window.location.reload(true),
          ...refreshPageButtonProps,
          ...commonButtonProps,
          variant: 'primary',
          children: 'Reload page',
        },
        {
          onClick: handleClearCache,
          ...commonButtonProps,
          variant: 'secondary',
          children: 'Clear cache',
          isDisabled: hasClearedCache,
        },
        {
          href: reportIssueLink,
          target: '_blank',
          ...reportIssueButtonProps,
          ...commonButtonProps,
          variant: 'secondary',
          children: 'Report issue',
        },
      ];
    }, [
      buttons,
      handleClearCache,
      hasClearedCache,
      refreshPageButtonProps,
      reportIssueButtonProps,
    ]);

    return (
      <div
        {...props}
        className={twMerge(
          'bg-mono-0 dark:bg-mono-180 p-6 rounded-lg',
          'max-w-xl space-y-4 mx-auto',
          className,
        )}
        ref={ref}
      >
        <Typography variant="h4" fw="bold" ta="center">
          {title}
        </Typography>

        <div className="space-y-2">
          {description.map((desc, index) => {
            // If the description is a string, or if the description is an object
            // and the noWrapper property is false, then wrap the description in a
            // Typography component.
            if (typeof desc === 'string' || !desc.noWrapper) {
              return (
                <Typography
                  key={index}
                  className="w-3/4 mx-auto break-words"
                  variant="body1"
                  ta="center"
                  fw="semibold"
                >
                  {typeof desc === 'string' ? desc : desc.children}
                </Typography>
              );
            }

            return <Fragment key={index}>{desc.children}</Fragment>;
          })}
        </div>

        <div className="flex items-center justify-center gap-2">
          {buttonProps.map((buttonProps, index) => (
            <Button key={index} {...buttonProps} />
          ))}
        </div>
      </div>
    );
  },
);
