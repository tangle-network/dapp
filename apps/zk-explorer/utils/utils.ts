import _ from 'lodash';
import { CircuitItem } from '../components/CircuitCard/types';
import {
  GitHubOAuthErrorParams,
  GitHubOAuthSuccessParams,
} from '../components/GitHubOAuthButton/types';
import { ProjectItem } from '../components/ProjectCard/types';
import { ITEMS_PER_PAGE } from '../constants';
import { User } from '../hooks/useAuth';
import {
  CircuitSearchResponseData,
  ProjectSearchResponseData,
  exchangeAuthCodeForOAuthToken,
} from './api';

export enum ItemType {
  Project = 'Project',
  Circuit = 'Circuit',
}

export enum RelativePageUrl {
  Home = '/',
  SubmitProject = '/submit',
  Dashboard = '/dashboard',
}

export enum SearchParamKey {
  SearchQuery = 'q',
  PaginationPageNumber = 'page',
  Filters = 'filters',
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
  // TODO: Consider showing a modal or toast message to let the user know when OAuth fails.
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

// TODO: This is temporary, until the backend is implemented.
export function getMockProjects(): ProjectSearchResponseData {
  const mockProjects = Array<ProjectItem>(ITEMS_PER_PAGE).fill({
    ownerAvatarUrl:
      'https://avatars.githubusercontent.com/u/76852793?s=200&v=4',
    repositoryOwner: 'webb',
    repositoryName: 'masp',
    stargazerCount: 123,
    circuitCount: 24,
    description:
      'Short blurb about what the purpose of this circuit. This is a longer line to test multiline.',
    contributorAvatarUrls: Array(15).fill(
      'https://avatars.githubusercontent.com/u/76852793?s=200&v=4'
    ),
  });

  return {
    projects: mockProjects,
    resultCount: mockProjects.length,
  };
}

// TODO: This is temporary, until the backend is implemented.
export function getMockCircuits(): CircuitSearchResponseData {
  const mockCircuits = Array<CircuitItem>(ITEMS_PER_PAGE).fill({
    ownerAvatarUrl:
      'https://avatars.githubusercontent.com/u/76852793?s=200&v=4',
    filename: 'circuit.circom',
    description:
      'Short blurb about what the purpose of this circuit. This is a longer line to test multiline.',
    stargazerCount: 123,
    constraintCount: 456,
  });

  return {
    circuits: mockCircuits,
    resultCount: mockCircuits.length,
  };
}

export function setSearchParam(key: SearchParamKey, value: string | null) {
  const updatedSearchParams = new URLSearchParams(window.location.search);

  if (value === null || value === '') {
    updatedSearchParams.delete(key);
  } else {
    updatedSearchParams.set(key, value);
  }

  const searchParamsString =
    updatedSearchParams.size === 0 ? '' : `?${updatedSearchParams}`;

  const newUrl = window.location.pathname + searchParamsString;

  window.history.pushState({}, '', newUrl);
}

export function validateSearchQuery(searchQuery: string | null): boolean {
  const MIN_SEARCH_QUERY_LENGTH = 3;

  // A small query length can yield too many results. Let's
  // wait until the user has typed a more more specific query.
  return (
    searchQuery !== null &&
    searchQuery.length > 0 &&
    searchQuery.length >= MIN_SEARCH_QUERY_LENGTH
  );
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function computeUserDiff(initial: User, updated: User): Partial<User> {
  // Note that the user object is only composed of
  // primitive values, so there's no need to worry about
  // deep equality checks.
  return _.pickBy(
    updated,
    (value, key) => !_.isEqual(value, initial[key as keyof User])
  );
}
