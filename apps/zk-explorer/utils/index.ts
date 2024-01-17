export * from './api';
import _ from 'lodash';
import { CircuitItem } from '../components/CircuitCard';
import { ProjectItem } from '../components/ProjectCard';
import {
  GITHUB_LANGUAGE_COLORS_API_URL,
  GITHUB_URL_PREFIX,
  ITEMS_PER_PAGE,
} from '../constants';
import { User } from '../hooks/useAuth';
import { CircuitSearchResponseData } from '../server/circuits';
import { ProjectSearchResponseData } from '../server/projects';

export function createProjectDetailPath(
  repositoryOwner: string,
  repositoryName: string
): string {
  const encodedRepositoryOwner = encodeURIComponent(repositoryOwner);
  const encodedRepositoryName = encodeURIComponent(repositoryName);

  return `/project/${encodedRepositoryOwner}/${encodedRepositoryName}`;
}

export function createProofGenerationUrl(
  owner: string,
  repositoryName: string,
  circuitFilePath: string
): string {
  const encodedCircuitFilePath = encodeURIComponent(circuitFilePath);

  return (
    createProjectDetailPath(owner, repositoryName) +
    '/' +
    encodedCircuitFilePath
  );
}

export function tryOrElse<T>(fn: () => T, fallback: () => T): T {
  try {
    return fn();
  } catch (error) {
    return fallback();
  }
}

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

/**
 * A utility function to parse a GitHub URL into its owner and
 * repository name segments.
 *
 * In case the URL is invalid, `null` is returned.
 */
export function parseGithubUrl(url: string): [string, string] | null {
  const trimmedUrl = url.trim();

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

export function validateGithubUrl(url: string): boolean {
  return parseGithubUrl(url) !== null;
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

export function gracefullyParseJson<T = unknown>(
  jsonString: string
): T | Error {
  try {
    return JSON.parse(jsonString);
  } catch (possibleError) {
    if (possibleError instanceof Error) {
      return possibleError;
    }

    return new Error(
      'Unknown error because the thrown object is not an instance of an error'
    );
  }
}

export function getPathFilename(path: string): string {
  const segments = path.split('/');

  // Note that the path is guaranteed to have at least one
  // segment, so there's no need to worry about an
  // out-of-bounds error. Even if the path is just an empty
  // string, the last segment will be an empty string.
  return segments[segments.length - 1];
}

export async function getGitHubLanguageColors(
  colorList: string[]
): Promise<Record<string, string>> {
  const response = await fetch(GITHUB_LANGUAGE_COLORS_API_URL);

  if (!response.ok) {
    // TODO: Provide reason why the request failed.
    throw new Error('Failed to fetch GitHub language colors');
  }

  const formattedResponse = await response.json();

  const relevantLanguageColors = Object.keys(formattedResponse).filter(
    (color) => colorList.includes(color)
  );

  return relevantLanguageColors.reduce((map, language) => {
    // TODO: Might need to perform a deep copy here to avoid mutating the original object.
    const updatedMap = map;

    map[language] = formattedResponse[language].color;

    return updatedMap;
  }, {} as Record<string, string>);
}

export function artificialDelay(timeInMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}
