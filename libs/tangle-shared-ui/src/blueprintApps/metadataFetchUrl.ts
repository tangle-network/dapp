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
 * - `ipfs://<cid>` resolves to a single public ipfs.io gateway URL.
 * - `ar://<txid>` resolves to a single arweave.net gateway URL.
 * - `data:application/json,…` (with or without `;base64`) is returned as-is;
 *   the fetch API resolves data URIs inline without a network round-trip.
 * - A bare `https://github.com/<owner>/<repo>` URL expands to TWO
 *   candidates: the `main` branch first, then `master` as a fallback. A
 *   nontrivial fraction of org repos still default to `master`, and a
 *   single hardcoded branch would 404 for them — the caller iterates so
 *   we never need an extra round-trip when `main` exists.
 * - Anything else (GitHub URLs with sub-paths, arbitrary HTTPS URLs) is
 *   passed through `rewriteLocalhostUrlForBrowser` and returned as a
 *   single-element list.
 */
export const resolveBlueprintMetadataFetchUrls = (
  metadataUri: string,
): string[] => {
  if (metadataUri.startsWith('ipfs://')) {
    const cid = metadataUri.replace('ipfs://', '');
    return [`https://ipfs.io/ipfs/${cid}`];
  }

  if (metadataUri.startsWith('ar://')) {
    const txid = metadataUri.replace('ar://', '');
    return [`https://arweave.net/${txid}`];
  }

  if (metadataUri.startsWith('data:')) {
    // `fetch` handles data: URIs natively on every supported browser. Pass
    // through verbatim — no host rewrite needed, no gateway, no fallback.
    return [metadataUri];
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
