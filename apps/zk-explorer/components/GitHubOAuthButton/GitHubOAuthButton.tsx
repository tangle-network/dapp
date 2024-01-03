'use client';

import { GithubFill } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC, MouseEventHandler, useCallback, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { GitHubOAuthButtonProps } from './types';

export const GitHubOAuthButton: FC<GitHubOAuthButtonProps> = ({
  onClick,
  username,
  onSignedInClick,
  redirectUri,
  clientId,
  scope,
  state,
  doInterceptOauthRedirect,
  onOAuthError,
  onOAuthSuccess,
  className,
  ...rest
}) => {
  const isSignedIn = username !== undefined;

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (onClick !== undefined) {
        onClick(e);
      }

      if (isSignedIn) {
        if (onSignedInClick !== undefined) {
          onSignedInClick(e);
        }
      } else {
        const authUrl = new URL('https://github.com/login/oauth/authorize');
        const finalRedirectUri = redirectUri ?? window.location.href;

        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('redirect_uri', finalRedirectUri);
        authUrl.searchParams.append('scope', scope);

        if (state !== undefined) {
          authUrl.searchParams.append('state', state);
        }

        window.location.href = authUrl.toString();
      }
    },
    [isSignedIn, clientId, scope, state, redirectUri, onClick, onSignedInClick]
  );

  // TODO: Effect is being executed twice. Likely caused by SSR or React's strict mode.
  // Handle possible GitHub OAuth redirect and error query parameters.
  useEffect(() => {
    if (doInterceptOauthRedirect !== undefined && !doInterceptOauthRedirect) {
      return;
    }

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (code !== null) {
      if (onOAuthSuccess !== undefined) {
        onOAuthSuccess({ code, state });
      }
    } else if (error !== null && errorDescription !== null) {
      if (onOAuthError !== undefined) {
        onOAuthError({ error, errorDescription, state });
      }
    }
  }, [doInterceptOauthRedirect, onOAuthSuccess, onOAuthError]);

  const signedInClassName = isSignedIn
    ? twMerge(
        'border-mono-60 dark:border-mono-120 hover:dark:border-mono-120',
        'hover:bg-mono-0/30 dark:bg-mono-140 dark:hover:bg-mono-160'
      )
    : '';

  const textColor = isSignedIn
    ? 'dark:text-mono-0'
    : 'text-mono-0 dark:text-mono-140';

  const iconFillColor = isSignedIn
    ? 'dark:fill-mono-0'
    : 'fill-mono-0 dark:fill-mono-140';

  const themeClasses = 'border-mono-140';

  return (
    <Button
      {...rest}
      className={twMerge(signedInClassName, 'px-4', themeClasses, className)}
      variant={isSignedIn ? 'secondary' : 'primary'}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <GithubFill className={iconFillColor} size="lg" />

        <Typography
          className={textColor}
          variant="body1"
          fw="bold"
          component="p"
        >
          {username !== undefined ? `@${username}` : 'Sign In'}
        </Typography>
      </div>
    </Button>
  );
};
