'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import { GithubFill } from '@webb-tools/icons';
import { twMerge } from 'tailwind-merge';
import { FC, MouseEventHandler, useCallback, useEffect } from 'react';
import { GitHubOAuthButtonProps } from './types';

export const GitHubOAuthButton: FC<GitHubOAuthButtonProps> = ({
  clientId,
  redirectUri,
  scope,
  state,
  doInterceptOauthRedirect,
  username,
  onOAuthSuccess,
  onOAuthError,
  onSignedInClick,
  onClick,
  ...rest
}) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (onClick !== undefined) {
        onClick(e);
      }

      const isSignedIn = username !== undefined;

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
    [clientId, redirectUri, scope, state, username, onSignedInClick, onClick]
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

    if (code !== null && state !== null) {
      if (onOAuthSuccess !== undefined) {
        onOAuthSuccess({ code, state });
      }
    } else if (error !== null && errorDescription !== null) {
      if (onOAuthError !== undefined) {
        onOAuthError({ error, errorDescription, state });
      }
    }
  }, [doInterceptOauthRedirect, onOAuthSuccess, onOAuthError]);

  return (
    <button
      {...rest}
      type="button"
      className={twMerge(
        'rounded-full border-2 py-2 px-4',
        'bg-mono-0/10 border-mono-60',
        'hover:bg-mono-0/30',
        'dark:bg-mono-0/5 dark:border-mono-140',
        'dark:hover:bg-mono-0/10',
        rest.className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <GithubFill size="lg" />

        <Typography variant="body1" fw="bold" component="p">
          {username ? `@${username}` : 'Sign in with GitHub'}
        </Typography>
      </div>
    </button>
  );
};
