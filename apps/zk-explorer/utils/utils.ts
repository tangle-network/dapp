import { exchangeAuthCodeForOAuthToken } from './api';
import {
  GitHubOAuthErrorParams,
  GitHubOAuthSuccessParams,
} from '../components/GitHubOAuthButton/types';

export function validateGithubUrl(url: string): boolean {
  const trimmedUrl = url.trim();
  const GITHUB_URL_PREFIX = 'https://github.com/'; // TODO: Consider whether HTTP URLs should be allowed.

  if (!trimmedUrl.startsWith(GITHUB_URL_PREFIX)) {
    return false;
  }

  const significantPathSegment = trimmedUrl.slice(GITHUB_URL_PREFIX.length);
  const parts = significantPathSegment.split('/');

  // The significant path segment should be in the form of
  // <username>/<repository-name>, so there should be exactly
  // two parts.
  if (parts.length !== 2) {
    return false;
  }

  const segmentRegex = /^([a-zA-Z0-9_-]+)$/i;
  const owner = parts[0];
  const repo = parts[1];

  return segmentRegex.test(owner) && segmentRegex.test(repo);
}

export async function handleOAuthSuccess(
  params: GitHubOAuthSuccessParams
): Promise<void> {
  if (!(await exchangeAuthCodeForOAuthToken(params.code))) {
    reportProblem(
      'GitHub OAuth login failed: Could not exchange auth code for OAuth token.'
    );
  }
}

export function handleOAuthError(params: GitHubOAuthErrorParams): void {
  reportProblem(`GitHub OAuth login failed: ${params.errorDescription}`);
}

/**
 * An utility function to report a problem to the user.
 *
 * Compared to `console.error` or throwing an error, this function
 * is intended to be used for problems that are not critical to the
 * application's functionality, but should still be brought to the
 * user's attention.
 */
function reportProblem(message: string): void {
  // TODO: Provide better looking feedback to the user. Is there any toast component that can be used here?
  alert(message);
}
