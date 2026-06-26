/**
 * Richer editor for `metadata_json` string params.
 *
 * The sandbox blueprint takes a single `metadata_json: string` job param;
 * the operator parses that JSON server-side to choose a runtime backend.
 * Until now the UI presented metadata_json as an opaque <input>, forcing
 * customers to hand-craft JSON if they wanted Firecracker or TEE isolation.
 *
 * This component layers a structured selector + free-form JSON body on top
 * of the same string field:
 *
 *   - Container (docker) stays the default and produces a minimal payload —
 *     `runtime_backend` is omitted when docker is selected to keep on-chain
 *     job inputs small (the operator already defaults to docker).
 *   - Firecracker and TEE selections splice `runtime_backend` into the JSON
 *     object the user is composing, preserving every other field they typed.
 *   - The raw JSON stays editable; the selector reads back from the JSON,
 *     so power users can still drop in a complete payload by hand.
 *
 * Behaviour is unit-tested in MetadataJsonInput.spec.ts.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@tangle-network/sandbox-ui/primitives';
import { Text } from '../../../components/sandbox/SandboxUi';
import {
  applyRuntimeBackendToMetadata,
  normalizeRuntimeBackend,
  parseMetadata,
  RUNTIME_BACKEND_DEFAULT,
  RUNTIME_BACKEND_OPTIONS,
  type RuntimeBackend,
} from './metadataJson';

interface Props {
  label: string;
  path: string;
  value: string;
  onChange: (value: string) => void;
}

export const MetadataJsonInput: FC<Props> = ({
  label,
  path,
  value,
  onChange,
}) => {
  const [draftJson, setDraftJson] = useState<string>(value ?? '');

  // Resync the editor when the parent resets the form (e.g. after a successful
  // submit). The string compare avoids clobbering in-progress edits while the
  // user is typing.
  useEffect(() => {
    queueMicrotask(() => {
      setDraftJson((current) => (current === value ? current : (value ?? '')));
    });
  }, [value]);

  const parsed = useMemo(() => parseMetadata(draftJson), [draftJson]);

  const currentBackend = useMemo<RuntimeBackend>(() => {
    if (!parsed.ok || parsed.empty || parsed.object === null) {
      return RUNTIME_BACKEND_DEFAULT;
    }
    return (
      normalizeRuntimeBackend(parsed.object.runtime_backend) ??
      RUNTIME_BACKEND_DEFAULT
    );
  }, [parsed]);

  const propagate = useCallback(
    (next: string) => {
      setDraftJson(next);
      onChange(next);
    },
    [onChange],
  );

  const handleBackendChange = useCallback(
    (next: RuntimeBackend) => {
      // If the JSON is invalid we leave the textarea untouched so the user
      // sees their parse error and can correct it. applyRuntimeBackendToMetadata
      // returns the raw string verbatim in that case, but checking up-front
      // also stops us pushing duplicate change events when nothing differs.
      if (!parsed.ok) {
        return;
      }
      propagate(applyRuntimeBackendToMetadata(draftJson, next));
    },
    [draftJson, parsed.ok, propagate],
  );

  const handleJsonChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      propagate(event.currentTarget.value);
    },
    [propagate],
  );

  const activeOption =
    RUNTIME_BACKEND_OPTIONS.find((opt) => opt.value === currentBackend) ??
    RUNTIME_BACKEND_OPTIONS[0];

  return (
    <div className="py-1 space-y-3">
      <div>
        <Text variant="body2" className="mb-1">
          {label}{' '}
          <span className="text-mono-100 dark:text-mono-80 text-xs">
            (metadata_json)
          </span>
        </Text>
        <Text variant="body3" className="text-mono-100 dark:text-mono-80">
          The operator parses this JSON server-side. Pick a runtime backend and
          add any extra fields (image, env, ports, ...) the blueprint
          recognises.
        </Text>
      </div>

      <div>
        <Text variant="body3" className="mb-1 text-mono-100 dark:text-mono-80">
          Runtime Backend
        </Text>
        <Select
          value={currentBackend}
          onValueChange={(v: string) =>
            handleBackendChange(v as RuntimeBackend)
          }
        >
          <SelectTrigger
            id={`${path}-runtime-backend`}
            className="w-full"
            aria-label="Runtime backend"
          >
            <SelectValue placeholder="Select runtime backend" />
          </SelectTrigger>
          <SelectContent>
            {RUNTIME_BACKEND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Text variant="body3" className="mt-1 text-mono-100 dark:text-mono-80">
          {activeOption.description}
        </Text>
      </div>

      {currentBackend === 'firecracker' && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
          <Text variant="body3" className="text-yellow-300">
            Firecracker requires the selected operator to have MicroVM support
            enabled. If the operator runs Docker only, the CreateSandbox job
            will fail. Firecracker also forces <code>tee_required=false</code>;
            Firecracker + TEE composition is not supported.
          </Text>
        </div>
      )}

      {currentBackend === 'tee' && (
        <div className="rounded-lg border border-purple-40/30 bg-purple-40/10 p-3">
          <Text variant="body3" className="text-purple-40">
            TEE-backed sandboxes provision into a confidential VM. The operator
            forces <code>tee_required=true</code> for this request; only
            TEE-capable operators will accept it.
          </Text>
        </div>
      )}

      <div>
        <Text variant="body3" className="mb-1 text-mono-100 dark:text-mono-80">
          Raw JSON (advanced)
        </Text>
        <Textarea
          id={path}
          className="w-full h-32 p-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder='{ "image": "ghcr.io/...", "env": { "FOO": "bar" } }'
          value={draftJson}
          onChange={handleJsonChange}
          aria-invalid={!parsed.ok ? 'true' : undefined}
        />
        {!parsed.ok ? (
          <Text variant="body3" className="mt-1 text-red-500 dark:text-red-400">
            {parsed.error}
          </Text>
        ) : (
          <Text
            variant="body3"
            className="mt-1 text-mono-100 dark:text-mono-80"
          >
            {parsed.empty
              ? 'Empty metadata is sent as an empty string. The operator will use its defaults.'
              : currentBackend === RUNTIME_BACKEND_DEFAULT
                ? 'runtime_backend is omitted from this payload (operator default is docker).'
                : `runtime_backend = "${currentBackend}" will be included in the payload.`}
          </Text>
        )}
      </div>
    </div>
  );
};

export default MetadataJsonInput;
