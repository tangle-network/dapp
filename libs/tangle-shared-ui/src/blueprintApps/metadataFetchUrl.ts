import { rewriteLocalhostUrlForBrowser } from '../utils/localPreview';

// Matches a "bare" GitHub repo URL like `https://github.com/<owner>/<repo>`
// (optionally with a trailing slash or `.git` suffix). URLs with any
// additional path segments (e.g. `/tree/main/...`) intentionally do NOT
// match — those are assumed to already point at a specific resource and are
// returned untouched.
const GITHUB_REPO_PATTERN =
  /^https:\/\/github\.com\/([^/]+)\/([^/?#]+?)(?:\.git)?\/?$/;

/**
 * Translate an on-chain blueprint `metadataUri` into a URL the dapp can
 * `fetch()` to retrieve the metadata JSON document.
 *
 * - `ipfs://CID` is rewritten to the public ipfs.io gateway.
 * - A bare `https://github.com/<owner>/<repo>` URL is rewritten to the
 *   canonical raw `metadata/blueprint-metadata.json` path on the `main`
 *   branch. Repos that default to `master` will 404 — they can be fixed
 *   on-chain via `updateBlueprint`.
 * - Anything else (including GitHub URLs with sub-paths and arbitrary HTTPS
 *   URLs) is passed through `rewriteLocalhostUrlForBrowser` unchanged.
 */
export const resolveBlueprintMetadataFetchUrl = (
  metadataUri: string,
): string => {
  if (metadataUri.startsWith('ipfs://')) {
    const cid = metadataUri.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${cid}`;
  }

  const githubMatch = metadataUri.match(GITHUB_REPO_PATTERN);
  if (githubMatch) {
    const [, owner, repo] = githubMatch;
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/metadata/blueprint-metadata.json`;
  }

  return rewriteLocalhostUrlForBrowser(metadataUri);
};
