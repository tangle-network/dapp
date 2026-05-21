import { rewriteLocalhostUrlForBrowser } from '../utils/localPreview';

// Matches a "bare" GitHub repo URL like `https://github.com/<owner>/<repo>`
// (optionally with a trailing slash or `.git` suffix). URLs with any
// additional path segments (e.g. `/tree/main/...`) intentionally do NOT
// match — those are assumed to already point at a specific resource and are
// returned untouched.
const GITHUB_REPO_PATTERN =
  /^https:\/\/github\.com\/([^/]+)\/([^/?#]+?)(?:\.git)?\/?$/;

/**
 * Translate an on-chain blueprint `metadataUri` into the ORDERED list of
 * URLs the dapp should try in sequence to retrieve the metadata JSON
 * document. The first URL that returns a successful response wins.
 *
 * - `ipfs://CID` is rewritten to a single public ipfs.io gateway URL.
 * - A bare `https://github.com/<owner>/<repo>` URL expands to TWO
 *   candidates: the `main` branch first, then `master` as a fallback. A
 *   nontrivial fraction of org repos still default to `master`, and a
 *   single hardcoded branch would 404 for them — the caller iterates so
 *   we never need an extra round-trip when `main` exists.
 * - Anything else (including GitHub URLs with sub-paths and arbitrary
 *   HTTPS URLs) is passed through `rewriteLocalhostUrlForBrowser` and
 *   returned as a single-element list.
 */
export const resolveBlueprintMetadataFetchUrls = (
  metadataUri: string,
): string[] => {
  if (metadataUri.startsWith('ipfs://')) {
    const cid = metadataUri.replace('ipfs://', '');
    return [`https://ipfs.io/ipfs/${cid}`];
  }

  const githubMatch = metadataUri.match(GITHUB_REPO_PATTERN);
  if (githubMatch) {
    const [, owner, repo] = githubMatch;
    return [
      `https://raw.githubusercontent.com/${owner}/${repo}/main/metadata/blueprint-metadata.json`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/metadata/blueprint-metadata.json`,
    ];
  }

  return [rewriteLocalhostUrlForBrowser(metadataUri)];
};

/**
 * Backwards-compatible single-URL resolver. Returns the FIRST candidate
 * URL from {@link resolveBlueprintMetadataFetchUrls}.
 *
 * Prefer {@link resolveBlueprintMetadataFetchUrls} at fetch sites — it
 * returns the full fallback list so callers can try `master` after `main`
 * for GitHub URLs.
 */
export const resolveBlueprintMetadataFetchUrl = (metadataUri: string): string =>
  resolveBlueprintMetadataFetchUrls(metadataUri)[0];
