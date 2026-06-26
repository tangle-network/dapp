import { type ChangeEvent, type FC, useCallback } from 'react';
import { Input, Label } from '@tangle-network/sandbox-ui/primitives';

import { ZERO_BYTES32, type AttestationMode, type WizardState } from './types';
import { sha256OfBytes, sha256OfFile } from './hashing';

/**
 * Step 3: optional attestation bundle digest.
 *
 * The contract field is `bytes32 attestationHash` — zero means "no bundle".
 * Three operator paths:
 *   - Skip: keep zero sentinel.
 *   - Upload bundle: drop a sigstore / SLSA file, we sha256 it locally.
 *   - Hash from URL: fetch the bundle from a URL the operator pastes (CORS
 *     permitting) and hash the bytes. We surface a clear error if CORS
 *     blocks the fetch — the operator falls back to the upload path.
 */
interface Step3Props {
  state: WizardState;
  setState: (updater: (prev: WizardState) => WizardState) => void;
}

export const Step3Attestation: FC<Step3Props> = ({ state, setState }) => {
  const handleMode = useCallback(
    (mode: AttestationMode) => {
      setState((p) => ({
        ...p,
        attestationMode: mode,
        attestationFile: mode === 'upload-bundle' ? p.attestationFile : null,
        attestationUrl: mode === 'hash-from-url' ? p.attestationUrl : '',
        attestationHash: mode === 'skip' ? ZERO_BYTES32 : p.attestationHash,
      }));
    },
    [setState],
  );

  const handleFile = useCallback(
    async (file: File | null) => {
      if (file === null) {
        setState((p) => ({
          ...p,
          attestationFile: null,
          attestationHash: ZERO_BYTES32,
        }));
        return;
      }
      const hash = await sha256OfFile(file);
      setState((p) => ({
        ...p,
        attestationFile: file,
        attestationHash: hash,
      }));
    },
    [setState],
  );

  const handleHashFromUrl = useCallback(async () => {
    const url = state.attestationUrl.trim();
    if (!url) return;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) {
        throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
      }
      const buf = await res.arrayBuffer();
      const hash = await sha256OfBytes(buf);
      setState((p) => ({ ...p, attestationHash: hash }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState((p) => ({
        ...p,
        attestationHash: ZERO_BYTES32,
      }));
      // Surface the error inline. We reuse pinError so we don't need a
      // separate error slot, but namespace the message so the user knows.
      window.alert(
        `Could not fetch + hash attestation bundle.\n\n${msg}\n\nFall back to "Upload sigstore bundle".`,
      );
    }
  }, [setState, state.attestationUrl]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-semibold text-[10px] text-mono-100 dark:text-mono-60 uppercase tracking-wider">
          Attestation (optional)
        </p>
        <p className="text-mono-100 dark:text-mono-60 text-xs">
          An attestation bundle (SLSA, sigstore, etc.) lets auditors and
          operators verify the build provenance. Zero means "no bundle" and is
          accepted by the contract.
        </p>
      </div>

      <div className="space-y-2">
        <AttestationOption
          label="Skip"
          description="Publish without an attestation bundle digest."
          selected={state.attestationMode === 'skip'}
          onSelect={() => handleMode('skip')}
        />
        <AttestationOption
          label="Upload sigstore bundle"
          description="Drop the bundle file. sha256 is computed locally."
          selected={state.attestationMode === 'upload-bundle'}
          onSelect={() => handleMode('upload-bundle')}
        />
        <AttestationOption
          label="Compute hash from URL"
          description="We fetch the file and hash the bytes (CORS must allow it)."
          selected={state.attestationMode === 'hash-from-url'}
          onSelect={() => handleMode('hash-from-url')}
        />
      </div>

      {state.attestationMode === 'upload-bundle' && (
        <div className="space-y-2">
          <Label htmlFor="attestation-file">Attestation bundle</Label>
          <Input
            id="attestation-file"
            type="file"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.currentTarget.files?.[0] ?? null;
              void handleFile(file);
            }}
          />
          {state.attestationFile && (
            <p className="break-all font-mono text-mono-200 dark:text-mono-0 text-xs">
              sha256 {state.attestationHash}
            </p>
          )}
        </div>
      )}

      {state.attestationMode === 'hash-from-url' && (
        <div className="space-y-2">
          <Label htmlFor="attestation-url">Bundle URL</Label>
          <Input
            id="attestation-url"
            placeholder="https://…/bundle.json"
            value={state.attestationUrl}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setState((p) => ({
                ...p,
                attestationUrl: e.currentTarget.value,
              }))
            }
          />
          <div className="flex items-center justify-between">
            <p className="font-mono text-mono-200 dark:text-mono-0 text-xs">
              {state.attestationHash === ZERO_BYTES32
                ? 'sha256 — not yet computed'
                : `sha256 ${state.attestationHash}`}
            </p>
            <button
              type="button"
              className="text-purple-40 text-xs hover:underline"
              onClick={() => void handleHashFromUrl()}
            >
              Fetch + hash
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AttestationOption: FC<{
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}> = ({ label, description, selected, onSelect }) => (
  <label
    className={[
      'flex cursor-pointer items-start gap-3 rounded-lg border p-3',
      selected
        ? 'border-purple-40/50 bg-purple-40/5'
        : 'border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 hover:border-purple-40/30',
    ].join(' ')}
  >
    <input
      type="radio"
      checked={selected}
      onChange={onSelect}
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

export default Step3Attestation;
