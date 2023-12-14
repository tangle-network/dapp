'use client';

import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { Typography } from '@webb-tools/webb-ui-components';
import { GithubFill } from '@webb-tools/icons';
import { twMerge } from 'tailwind-merge';
import { FC, MouseEventHandler, useEffect } from 'react';

export type GitHubOAuthRedirectParams = {
  code: string
  state: string
}

export type GitHubOAuthErrorParams = {
  error: string
  errorDescription: string
  state: string
}

export type GitHubOAuthButtonProps = PropsOf<'button'> & {
  clientId: string
  redirectUri?: string
  scope: string
  /**
   * An unguessable random string. It is used to protect against cross-site
   * request forgery attacks (CSRF).
   */
  state?: string
  /**
   * Override default behavior of handling GitHub OAuth redirect and error
   * query parameters. If this is `false`, the button will not handle
   * GitHub OAuth redirect or error query parameters, and the provided
   * `onOauthRedirect` and `onOauthError` callbacks will not be called.
   */
  doInterceptOauthRedirect?: boolean
  /**
   * The username of the user that is signed in.
   *
   * If this is `undefined`, the button will display "Sign in with GitHub",
   * and the user will be considered to be signed out.
   */
  username?: string;
  onOauthRedirect?: (params: GitHubOAuthRedirectParams) => void
  onOauthError?: (params: GitHubOAuthErrorParams) => void
  /**
   * Callback that is called when the button is clicked, and the user is
   * considered to be signed in.
   */
  onSignedInClick?: MouseEventHandler<HTMLButtonElement>
}

export const GitHubOAuthButton: FC<GitHubOAuthButtonProps> = (props) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (props.onClick !== undefined) {
      props.onClick(e);
    }

    const isSignedIn = props.username !== undefined;

    if (isSignedIn) {
      if (props.onSignedInClick !== undefined) {
        props.onSignedInClick(e);
      }
    }
    else {
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
  }

  const {doInterceptOauthRedirect, onOauthRedirect, onOauthError} = props;

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
      if (onOauthRedirect !== undefined) {
        onOauthRedirect({code, state});
      }
    }
    else if (error !== null && errorDescription !== null && state !== null) {
      if (onOauthError !== undefined) {
        onOauthError({error, errorDescription, state});
      }
    }
  }, [doInterceptOauthRedirect, onOauthRedirect, onOauthError])

  return (
    <button
      {...props}
      type="button"
      className={twMerge(
        'rounded-full border-2 py-2 px-4',
        'bg-mono-0/10 border-mono-60',
        'hover:bg-mono-0/30',
        'dark:bg-mono-0/5 dark:border-mono-140',
        'dark:hover:bg-mono-0/10',
        props.className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <GithubFill size="lg" />

        <Typography
          variant="body1"
          fw="bold"
          component="p"
        >
          {props.username ? `@${props.username}` : 'Sign in with GitHub'}
        </Typography>
      </div>
    </button>
  )
}
