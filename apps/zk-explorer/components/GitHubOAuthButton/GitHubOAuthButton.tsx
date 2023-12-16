'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import { GithubFill } from '@webb-tools/icons';
import { twMerge } from 'tailwind-merge';
import { FC, MouseEventHandler, useEffect } from 'react';
import { GitHubOAuthButtonProps } from './types';

export const GitHubOAuthButton: FC<GitHubOAuthButtonProps> = (props) => {
  const isSignedIn = props.username !== undefined;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (props.onClick !== undefined) {
      props.onClick(e);
    }

    if (isSignedIn) {
      if (props.onSignedInClick !== undefined) {
        props.onSignedInClick(e);
      }
    } else {
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      const finalRedirectUri = props.redirectUri ?? window.location.href;

      authUrl.searchParams.append('client_id', props.clientId);
      authUrl.searchParams.append('redirect_uri', finalRedirectUri);
      authUrl.searchParams.append('scope', props.scope);

      if (props.state !== undefined) {
        authUrl.searchParams.append('state', props.state);
      }

      window.location.href = authUrl.toString();
    }
  };

  const { doInterceptOauthRedirect, onOAuthSuccess, onOAuthError } = props;

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

  const colors = isSignedIn
    ? twMerge(
        'bg-mono-0/10 border-mono-60',
        'hover:bg-mono-0/30',
        'dark:bg-mono-0/5 dark:border-mono-140',
        'dark:hover:bg-mono-0/10',
        props.className
      )
    : twMerge('dark:bg-mono-20 dark:text-mono-140');

  const textColor = isSignedIn ? 'dark:text-mono-180' : 'dark:text-mono-140';

  const iconFillColor = isSignedIn
    ? 'dark:fill-mono-180'
    : 'dark:fill-mono-140';

  return (
    <button
      {...props}
      type="button"
      className={twMerge(
        'rounded-full border-2 py-2 px-4',
        colors,
        props.className
      )}
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
          {props.username ? `@${props.username}` : 'Sign in with GitHub'}
        </Typography>
      </div>
    </button>
  );
};
