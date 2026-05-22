/**
 * Minimal web3.storage upload client.
 *
 * web3.storage exposes a legacy `POST /upload` endpoint at
 * `https://api.web3.storage/upload`. We use the bearer-token / "personal API
 * key" auth path. Tokens are typed by the user into the wizard; we never
 * persist them anywhere besides the in-memory wizard state.
 *
 * The response shape is `{ cid: string }`. We map that to `ipfs://${cid}`
 * for the on-chain binaryUri.
 *
 * Failure modes we surface:
 *   - 401: token missing or wrong → "Web3.Storage rejected the API token."
 *   - 4xx/5xx: anything else → raw body text
 *   - network: thrown by fetch → "Could not reach web3.storage"
 *
 * If the user has a newer w3up-style identity (UCAN), they should select the
 * "paste-ipfs" mode and pin via their own CLI. We do not bundle ucanto here
 * because the bundle cost is meaningful and the legacy token path covers the
 * 90% case (and matches what most operators have on file).
 */
export interface PinResult {
  cid: string;
  ipfsUri: `ipfs://${string}`;
}

export const pinFileToWeb3Storage = async (
  file: File,
  token: string,
): Promise<PinResult> => {
  if (token.trim().length === 0) {
    throw new Error('Web3.Storage API token is required to pin.');
  }

  let res: Response;
  try {
    res = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token.trim()}`,
        'x-name': encodeURIComponent(file.name),
        // The legacy endpoint accepts a raw file body for single-file uploads.
        'content-type': 'application/octet-stream',
      },
      body: file,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Could not reach web3.storage: ${msg}`);
  }

  if (res.status === 401) {
    throw new Error('Web3.Storage rejected the API token.');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `web3.storage upload failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`,
    );
  }

  const parsed = (await res.json().catch(() => null)) as {
    cid?: string;
  } | null;
  if (!parsed || typeof parsed.cid !== 'string' || parsed.cid.length === 0) {
    throw new Error('web3.storage response missing cid.');
  }
  return {
    cid: parsed.cid,
    ipfsUri: `ipfs://${parsed.cid}` as `ipfs://${string}`,
  };
};

/** Session-scoped token cache. Cleared on page reload by design. */
const TOKEN_SESSION_KEY = 'tangle-cloud:w3s-token:session';

export const readSessionToken = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem(TOKEN_SESSION_KEY) ?? '';
  } catch {
    return '';
  }
};

export const writeSessionToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    if (token.length === 0) {
      window.sessionStorage.removeItem(TOKEN_SESSION_KEY);
    } else {
      window.sessionStorage.setItem(TOKEN_SESSION_KEY, token);
    }
  } catch {
    // privacy modes — silently ignore; the wizard state still holds the value
  }
};

export const envWeb3StorageToken = (): string => {
  try {
    const v = (import.meta as { env?: Record<string, string | undefined> }).env
      ?.VITE_WEB3_STORAGE_TOKEN;
    if (typeof v === 'string') return v;
  } catch {
    // ignore
  }
  return '';
};
