export * from './api';
import _, { capitalize } from 'lodash';
import { CircuitItem } from '../components/CircuitCard/types';
import { ProjectItem } from '../components/ProjectCard/types';
import { ITEMS_PER_PAGE } from '../constants';
import { User } from '../hooks/useAuth';
import { CircuitSearchResponseData, ProjectSearchResponseData } from './api';

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
  Root = '/',
  SubmitProject = '/submit',
  Dashboard = '/dashboard',
}

export enum DynamicPath {
  Project = 'project',
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

export function isPageUrl(pathSegment: string): pathSegment is RelativePageUrl {
  return Object.values(RelativePageUrl).includes(
    pathSegment as RelativePageUrl
  );
}

export function getPageName(page: RelativePageUrl): string {
  switch (page) {
    case RelativePageUrl.Root:
      return 'Home';
    case RelativePageUrl.SubmitProject:
      return 'Upload Project';
    case RelativePageUrl.Dashboard:
      return 'My Dashboard';
  }
}

export function getDynamicPathSegmentNames(
  dynamicPath: DynamicPath,
  segments: string[]
): string[] {
  switch (dynamicPath) {
    case DynamicPath.Project:
      return ['Project', ...segments];
  }
}

function isDynamicPath(pathSegment: string): pathSegment is DynamicPath {
  return Object.values(DynamicPath).includes(pathSegment as DynamicPath);
}

export function getPathBreadcrumbNames(pathSegments: string[]): string[] {
  if (pathSegments.length === 0) {
    return [];
  }

  const firstSegment = pathSegments[0];
  const firstSegmentWithSlash = `/${firstSegment}`;

  if (isPageUrl(firstSegmentWithSlash)) {
    return [getPageName(firstSegmentWithSlash)];
  } else if (isDynamicPath(firstSegment)) {
    return getDynamicPathSegmentNames(firstSegment, pathSegments.slice(1));
  }

  // If the first segment is neither a known page URL
  // nor a known dynamic dynamic path, simply capitalize
  // each segment. This serves as a graceful fallback.
  return pathSegments.map(capitalize);
}
