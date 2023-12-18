import { exchangeAuthCodeForOAuthToken, submitProject } from './api';
import {
  GitHubOAuthErrorParams,
  GitHubOAuthSuccessParams,
} from '../components/GitHubOAuthButton/types';
import assert from 'assert';

export enum PageUrl {
  Home = '/',
  SubmitProject = '/submit',
}

export function validateGithubUrl(url: string): boolean {
  return parseGithubUrl(url) !== null;
}

/**
 * A utility function to parse a GitHub URL into its owner and
 * repository name segments.
 *
 * In case the URL is invalid, `null` is returned.
 */
export function parseGithubUrl(url: string): [string, string] | null {
  const trimmedUrl = url.trim();
  const GITHUB_URL_PREFIX = 'https://github.com/'; // TODO: Consider whether HTTP URLs should be allowed.

  if (!trimmedUrl.startsWith(GITHUB_URL_PREFIX)) {
    return null;
  }

  const slugPathSegment = trimmedUrl.slice(GITHUB_URL_PREFIX.length);
  const parts = slugPathSegment.split('/');

  // The slug path segment should be in the form of
  // <username>/<repository-name>, so there should be exactly
  // two parts.
  if (parts.length !== 2) {
    return null;
  }

  const segmentRegex = /^([a-zA-Z0-9_-]+)$/i;
  const owner = parts[0];
  const repo = parts[1];

  if (!segmentRegex.test(owner) || !segmentRegex.test(repo)) {
    return null;
  }

  return [owner, repo];
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

/**
 * Submit a project to the ZK Explorer.
 *
 * This assumes that the provided GitHub URL is valid.
 * A string is returned in case of an error message from the backend,
 * otherwise `null` is returned.
 */
export async function handleSubmitProject(
  githubUrl: string
): Promise<string | null> {
  const response = await submitProject(githubUrl);

  if (response.isSuccess) {
    const githubUrlParseResult = parseGithubUrl(githubUrl);

    assert(
      githubUrlParseResult !== null,
      'Github URL should be valid after a successful submission.'
    );

    const [owner, repo] = githubUrlParseResult;

    // Navigate to the newly created project page.
    window.location.href = `${window.location.origin}/@${owner}/${repo}`;

    // Note that this function (should) never return at this point.
    return null;
  }

  assert(
    response.errorMessage !== undefined,
    'Error message should be provided when the response did not indicate success.'
  );

  return response.errorMessage;
}
