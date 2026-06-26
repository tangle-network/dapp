import { type ChangeEvent, type FC, useCallback } from 'react';
import { Button, Input, Label } from '@tangle-network/sandbox-ui/primitives';

import {
  isValidIpfsUri,
  isValidHttpsUri,
  isGithubRawHost,
  type HostingMode,
  type WizardState,
} from './types';
import {
  envWeb3StorageToken,
  pinFileToWeb3Storage,
  writeSessionToken,
} from './web3Storage';

/**
 * Step 2: where does the binary live?
 *
 * The wizard never invents a URI on its own. Either:
 *   - the operator pastes one (IPFS or raw GitHub), or
 *   - they upload to web3.storage from this dialog and we capture the CID.
 *
 * "GitHub raw" gets its own option (vs. "any https URL") because the only
 * URL we want operators to use under the HTTP family is a content-addressed
 * one. A raw.githubusercontent.com link pinned to a commit hash is content-
 * addressed in practice (commit hash → tree → blob). We do NOT validate the
 * commit-hash form because reasonable people use tags; the helper text spells
 * out the recommendation.
 */
interface Step2Props {
  state: WizardState;
  setState: (updater: (prev: WizardState) => WizardState) => void;
}

export const Step2Hosting: FC<Step2Props> = ({ state, setState }) => {
  const handleMode = useCallback(
    (mode: HostingMode) => {
      setState((p) => ({
        ...p,
        hostingMode: mode,
        // Reset the URI when switching paths so leftover IPFS text doesn't
        // accidentally ship after the user changes their mind.
        binaryUri: mode === p.hostingMode ? p.binaryUri : '',
        pinError: null,
      }));
    },
    [setState],
  );

  const handleUri = useCallback(
    (uri: string) => setState((p) => ({ ...p, binaryUri: uri })),
    [setState],
  );

  const handleToken = useCallback(
    (token: string) => {
      setState((p) => ({ ...p, web3StorageToken: token }));
      writeSessionToken(token);
    },
    [setState],
  );

  const handlePin = useCallback(async () => {
    if (state.binaryFile === null) {
      setState((p) => ({
        ...p,
        pinError: 'Upload a binary in step 1 before pinning.',
      }));
      return;
    }
    const token = state.web3StorageToken || envWeb3StorageToken();
    if (!token) {
      setState((p) => ({
        ...p,
        pinError: 'Paste a web3.storage API token to authorize the upload.',
      }));
      return;
    }
    setState((p) => ({ ...p, isPinning: true, pinError: null }));
    try {
      const { ipfsUri } = await pinFileToWeb3Storage(state.binaryFile, token);
      setState((p) => ({ ...p, binaryUri: ipfsUri, isPinning: false }));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setState((p) => ({ ...p, isPinning: false, pinError: message }));
    }
  }, [setState, state.binaryFile, state.web3StorageToken]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-semibold text-[10px] text-mono-100 dark:text-mono-60 uppercase tracking-wider">
          Hosting
        </p>
        <div className="space-y-2">
          <HostingOption
            label="I have an IPFS URI"
            description="Paste an existing ipfs://… URI you've already pinned elsewhere."
            selected={state.hostingMode === 'paste-ipfs'}
            onSelect={() => handleMode('paste-ipfs')}
          />
          <HostingOption
            label="Pin to IPFS via web3.storage"
            description="Upload the file from step 1 to web3.storage. Returns an ipfs:// URI."
            selected={state.hostingMode === 'pin-web3-storage'}
            onSelect={() => handleMode('pin-web3-storage')}
            disabled={state.binaryFile === null}
            disabledReason="Upload a binary in step 1 first."
          />
          <HostingOption
            label="Use a GitHub raw URL"
            description="https://raw.githubusercontent.com/<org>/<repo>/<sha>/path. Prefer commit hashes over branches."
            selected={state.hostingMode === 'github-raw'}
            onSelect={() => handleMode('github-raw')}
          />
        </div>
      </div>

      {state.hostingMode === 'paste-ipfs' && (
        <div className="space-y-2">
          <Label htmlFor="ipfs-uri">IPFS URI</Label>
          <Input
            id="ipfs-uri"
            placeholder="ipfs://bafy…"
            value={state.binaryUri}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleUri(e.currentTarget.value)
            }
            className="font-mono"
          />
          {state.binaryUri.length > 0 && !isValidIpfsUri(state.binaryUri) && (
            <p className="text-red-500 dark:text-red-400 text-xs">
              Must start with <code>ipfs://</code>.
            </p>
          )}
        </div>
      )}

      {state.hostingMode === 'pin-web3-storage' && (
        <div className="space-y-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-3">
          <div className="space-y-1.5">
            <Label htmlFor="w3s-token">Web3.Storage API token</Label>
            <Input
              id="w3s-token"
              placeholder={
                envWeb3StorageToken().length > 0
                  ? '(using VITE_WEB3_STORAGE_TOKEN; paste to override)'
                  : 'eyJhbGciOiJI…'
              }
              type="password"
              value={state.web3StorageToken}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleToken(e.currentTarget.value)
              }
              className="font-mono"
            />
            <p className="text-mono-100 dark:text-mono-60 text-xs">
              Stored only in <code>sessionStorage</code> for this tab. Cleared
              when you close the browser tab.
            </p>
          </div>
          <Button
            variant="sandbox"
            onClick={() => void handlePin()}
            loading={state.isPinning}
            disabled={state.isPinning || state.binaryFile === null}
          >
            {state.binaryUri.startsWith('ipfs://')
              ? 'Re-pin to IPFS'
              : 'Pin to IPFS'}
          </Button>
          {state.pinError && (
            <p className="text-red-500 dark:text-red-400 text-xs">
              {state.pinError}
            </p>
          )}
          {state.binaryUri.startsWith('ipfs://') && (
            <p className="break-all font-mono text-success text-xs">
              {state.binaryUri}
            </p>
          )}
        </div>
      )}

      {state.hostingMode === 'github-raw' && (
        <div className="space-y-2">
          <Label htmlFor="github-uri">GitHub raw URL</Label>
          <Input
            id="github-uri"
            placeholder="https://raw.githubusercontent.com/org/repo/sha/path"
            value={state.binaryUri}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleUri(e.currentTarget.value)
            }
            className="font-mono"
          />
          {state.binaryUri.length > 0 && !isValidHttpsUri(state.binaryUri) && (
            <p className="text-red-500 dark:text-red-400 text-xs">
              Must be a valid https:// URL.
            </p>
          )}
          {state.binaryUri.startsWith('https://') &&
            !isGithubRawHost(state.binaryUri) && (
              <p className="text-mono-100 dark:text-mono-60 text-xs">
                This isn&apos;t a raw.githubusercontent.com URL. The contract
                will accept it, but operators can&apos;t verify what byte
                they&apos;ll get - prefer a CID or a pinned raw commit URL.
              </p>
            )}
        </div>
      )}

      {state.binaryUri.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-3">
          <div className="min-w-0 flex-1 pr-3">
            <p className="font-semibold text-[10px] text-mono-100 dark:text-mono-60 uppercase tracking-wider">
              Resolved URI
            </p>
            <p className="break-all font-mono text-mono-200 dark:text-mono-0 text-xs">
              {state.binaryUri}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              const href = state.binaryUri.startsWith('ipfs://')
                ? `https://w3s.link/ipfs/${state.binaryUri.slice('ipfs://'.length)}`
                : state.binaryUri;
              window.open(href, '_blank', 'noopener,noreferrer');
            }}
          >
            Preview
          </Button>
        </div>
      )}
    </div>
  );
};

const HostingOption: FC<{
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  disabledReason?: string;
}> = ({ label, description, selected, onSelect, disabled, disabledReason }) => (
  <label
    title={disabled ? disabledReason : undefined}
    className={[
      'flex items-start gap-3 rounded-lg border p-3',
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      selected
        ? 'border-purple-40/50 bg-purple-40/5'
        : 'border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 hover:border-purple-40/30',
    ].join(' ')}
  >
    <input
      type="radio"
      checked={selected}
      onChange={() => !disabled && onSelect()}
      disabled={disabled}
      className="mt-1"
    />
    <span>
      <span className="font-display font-bold text-mono-200 dark:text-mono-0 text-sm">
        {label}
      </span>
      <span className="mt-0.5 block text-mono-100 dark:text-mono-60 text-xs">
        {description}
      </span>
    </span>
  </label>
);

export default Step2Hosting;
