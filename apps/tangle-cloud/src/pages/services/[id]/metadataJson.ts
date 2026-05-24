/**
 * Pure helpers + constants for the `metadata_json` runtime backend selector.
 *
 * Kept in a non-component module so the React component file can stay
 * fast-refresh friendly (lint: react-refresh/only-export-components).
 *
 * The sandbox blueprint (and the ai-agent-instance variant) take a single
 * `metadata_json: string` job param. The operator parses that JSON and
 * dispatches to one of three runtime backends:
 *
 *   "docker" | "container"   -> Docker
 *   "firecracker" | "microvm" -> Firecracker
 *   "tee" | "confidential"   -> TEE (confidential VM)
 */

export const RUNTIME_BACKEND_DEFAULT = 'docker' as const;

export type RuntimeBackend = 'docker' | 'firecracker' | 'tee';

export const RUNTIME_BACKEND_OPTIONS: ReadonlyArray<{
  value: RuntimeBackend;
  label: string;
  short: string;
  description: string;
}> = [
  {
    value: 'docker',
    label: 'Container (Docker)',
    short: 'Container',
    description:
      'Default. Recommended for most workloads. Fastest provisioning, broadest operator support.',
  },
  {
    value: 'firecracker',
    label: 'MicroVM (Firecracker)',
    short: 'MicroVM',
    description:
      'Firecracker microVM isolation. Requires operators with Firecracker enabled. Stronger boundary than containers.',
  },
  {
    value: 'tee',
    label: 'Confidential VM (TEE)',
    short: 'Confidential VM',
    description:
      'TEE-backed confidential compute. Slowest provisioning, strongest isolation. Requires TEE-capable operators.',
  },
];

const RUNTIME_BACKEND_ALIASES: Record<string, RuntimeBackend> = {
  docker: 'docker',
  container: 'docker',
  firecracker: 'firecracker',
  microvm: 'firecracker',
  tee: 'tee',
  confidential: 'tee',
};

export const normalizeRuntimeBackend = (
  raw: unknown,
): RuntimeBackend | null => {
  if (typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  return RUNTIME_BACKEND_ALIASES[key] ?? null;
};

export type ParsedMetadata =
  | { ok: true; object: Record<string, unknown> | null; empty: boolean }
  | { ok: false; error: string };

export const parseMetadata = (raw: string): ParsedMetadata => {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, object: null, empty: true };
  }
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return {
        ok: true,
        object: parsed as Record<string, unknown>,
        empty: false,
      };
    }
    return {
      ok: false,
      error: 'metadata_json must be a JSON object (e.g. { "image": "..." }).',
    };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? `Invalid JSON: ${e.message}` : 'Invalid JSON.',
    };
  }
};

/**
 * Serialize an object back into a metadata_json string. Returns the empty
 * string when the object has no keys, so we never emit `{}` and bloat the
 * job payload unnecessarily.
 */
export const serializeMetadata = (object: Record<string, unknown>): string => {
  const keys = Object.keys(object);
  if (keys.length === 0) return '';
  return JSON.stringify(object, null, 2);
};

/**
 * Apply a runtime backend selection to a raw metadata_json string and return
 * the new string. Behaviour pinned by MetadataJsonInput.spec.ts:
 *  - docker (the operator default) is omitted from the payload entirely.
 *  - firecracker / tee are spliced in next to whatever the user typed.
 *  - invalid JSON is returned verbatim so the user can see + fix the error.
 */
export const applyRuntimeBackendToMetadata = (
  raw: string,
  next: RuntimeBackend,
): string => {
  const parsed = parseMetadata(raw);
  if (!parsed.ok) {
    return raw;
  }

  const base: Record<string, unknown> =
    parsed.object === null ? {} : { ...parsed.object };

  if (next === RUNTIME_BACKEND_DEFAULT) {
    delete base.runtime_backend;
  } else {
    base.runtime_backend = next;
  }

  return serializeMetadata(base);
};

/**
 * True when the schema field should render the structured metadata editor.
 *
 * Matches exactly `metadata_json` (snake_case is the on-chain convention for
 * sandbox blueprints) to avoid hijacking unrelated string fields.
 */
export const isMetadataJsonField = (name: string): boolean =>
  name === 'metadata_json';
