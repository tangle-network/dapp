export * from './api';
export * from './constants';
export * from './utils';

export function createProjectDetailPath(
  repositoryOwner: string,
  repositoryName: string
): string {
  return `/project/${repositoryOwner}/${repositoryName}`;
}

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

export function tryOrElse<T>(fn: () => T, fallback: () => T): T {
  try {
    return fn();
  } catch (error) {
    return fallback();
  }
}
