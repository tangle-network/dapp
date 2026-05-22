import { type ChangeEvent, type FC, useCallback } from 'react';
import { Input, Label } from '@tangle-network/sandbox-ui/primitives';
import type { Hex } from 'viem';

import { isValidSha256Hex, type WizardState, type SourceMode } from './types';
import { sha256OfFile } from './hashing';

/**
 * Step 1: pick a binary or paste a sha256 directly.
 *
 * The "set sha256 from existing on-chain pin" toggle exists because some
 * operators ship metadata-only re-publishes (e.g. attach a new attestation
 * URL but keep the binary itself byte-identical). For those cases we still
 * need the hash field populated — let them paste it.
 */
interface Step1Props {
  state: WizardState;
  setState: (updater: (prev: WizardState) => WizardState) => void;
}

export const Step1Binary: FC<Step1Props> = ({ state, setState }) => {
  const handleSourceMode = useCallback(
    (mode: SourceMode) => {
      setState((p) => ({
        ...p,
        sourceMode: mode,
        // Clear the alternate path so it can't leak stale data into review
        binaryFile: mode === 'sha256-only' ? null : p.binaryFile,
        binaryHash: null,
        isHashing: false,
      }));
    },
    [setState],
  );

  const handleFile = useCallback(
    async (file: File | null) => {
      setState((p) => ({
        ...p,
        binaryFile: file,
        binaryHash: null,
        isHashing: file !== null,
      }));
      if (file === null) return;
      try {
        const hash = await sha256OfFile(file);
        setState((p) => ({ ...p, binaryHash: hash, isHashing: false }));
      } catch (e) {
        setState((p) => ({ ...p, isHashing: false }));
        throw e;
      }
    },
    [setState],
  );

  const handleHashInput = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (trimmed === '') {
        setState((p) => ({ ...p, binaryHash: null }));
        return;
      }
      // Tolerate input without 0x prefix.
      const candidate = (
        trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
      ) as Hex;
      if (isValidSha256Hex(candidate)) {
        setState((p) => ({ ...p, binaryHash: candidate }));
      } else {
        setState((p) => ({ ...p, binaryHash: null }));
      }
    },
    [setState],
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
          Source
        </p>
        <div className="grid grid-cols-2 gap-2">
          <SourceModeCard
            selected={state.sourceMode === 'file'}
            title="Upload binary"
            description="Compute sha256 locally from the file you drop or browse."
            onClick={() => handleSourceMode('file')}
          />
          <SourceModeCard
            selected={state.sourceMode === 'sha256-only'}
            title="Use existing sha256"
            description="Binary already pinned. Paste the sha256 to update metadata only."
            onClick={() => handleSourceMode('sha256-only')}
          />
        </div>
      </div>

      {state.sourceMode === 'file' ? (
        <div className="space-y-2">
          <Label htmlFor="binary-file">Binary file</Label>
          <Input
            id="binary-file"
            type="file"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.currentTarget.files?.[0] ?? null;
              void handleFile(file);
            }}
          />
          {state.binaryFile && (
            <p className="text-muted-foreground text-xs">
              {state.binaryFile.name} ·{' '}
              {(state.binaryFile.size / 1024).toFixed(1)} KB
            </p>
          )}
          <p className="break-all font-mono text-foreground text-xs">
            sha256{' '}
            {state.isHashing
              ? 'hashing…'
              : (state.binaryHash ?? 'upload a file to compute hash')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="binary-hash">sha256</Label>
          <Input
            id="binary-hash"
            placeholder="0x… (64 hex chars)"
            value={state.binaryHash ?? ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleHashInput(e.currentTarget.value)
            }
            className="font-mono"
          />
          <p className="text-muted-foreground text-xs">
            Use this only if the binary is already pinned somewhere stable and
            you have the canonical sha256 to hand. The contract will store this
            value verbatim — no re-hashing happens on chain.
          </p>
        </div>
      )}
    </div>
  );
};

const SourceModeCard: FC<{
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ selected, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
      selected
        ? 'border-primary/50 bg-primary/5'
        : 'border-border bg-card hover:border-primary/30',
    ].join(' ')}
  >
    <span className="font-display font-bold text-foreground text-sm">
      {title}
    </span>
    <span className="text-muted-foreground text-xs">{description}</span>
  </button>
);

export default Step1Binary;
