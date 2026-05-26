/**
 * Scheme gating for blueprint `metadataUri` strings stored on-chain.
 *
 * Accepted schemes:
 *   - `ipfs://<cid>`              content-addressed, immutable. Preferred.
 *   - `ar://<txid>`               Arweave permanent storage, content-addressed.
 *   - `https://...`               HTTP over TLS (github raw, R2, S3 public, etc).
 *   - `data:application/json,...` inline manifest, optionally base64-encoded.
 *   - `data:text/plain,...`       inline manifest authored as plain text.
 *
 * Rejected:
 *   - `http://`                   no TLS — trivial MITM on metadata fetch.
 *   - `file://`, `ftp://`, `javascript:`, anything else.
 *
 * Lives in its own module (decoupled from `authoring.ts`) so the URI gate
 * can be unit-tested without pulling in modules that reference
 * `import.meta.env` (which the jest swc preset doesn't compile).
 */
export const isAllowedBlueprintMetadataUri = (metadataUri: string): boolean => {
  if (metadataUri.startsWith('ipfs://') || metadataUri.startsWith('ar://')) {
    return true;
  }
  if (metadataUri.startsWith('data:')) {
    const mimePrefix = metadataUri.slice(5).split(/[;,]/, 1)[0]?.trim();
    return mimePrefix === 'application/json' || mimePrefix === 'text/plain';
  }
  try {
    const url = new URL(metadataUri);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
};
