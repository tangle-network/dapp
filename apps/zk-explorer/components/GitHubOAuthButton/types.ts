import { Button } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { MouseEventHandler } from 'react';

export type GitHubOAuthSuccessParams = {
  code: string;
  state: string | null;
};

export type GitHubOAuthErrorParams = {
  error: string;
  errorDescription: string;
  state: string | null;
};

export type GitHubOAuthButtonProps = PropsOf<typeof Button> & {
  clientId: string;
  redirectUri?: string;
  scope: string;
  /**
   * An unguessable random string. It is used to protect against cross-site
   * request forgery attacks (CSRF).
   */
  state?: string;
  /**
   * Override default behavior of handling GitHub OAuth redirect and error
   * query parameters. If this is `false`, the button will not handle
   * GitHub OAuth redirect or error query parameters, and the provided
   * `onOauthRedirect` and `onOauthError` callbacks will not be called.
   */
  doInterceptOauthRedirect?: boolean;
  /**
   * The username of the user that is signed in.
   *
   * If this is `undefined`, the button will display "Sign in with GitHub",
   * and the user will be considered to be signed out.
   */
  username?: string;
  onOAuthSuccess?: (params: GitHubOAuthSuccessParams) => void;
  onOAuthError?: (params: GitHubOAuthErrorParams) => void;
  /**
   * Callback that is called when the button is clicked, and the user is
   * considered to be signed in.
   */
  onSignedInClick?: MouseEventHandler<HTMLButtonElement>;
};
