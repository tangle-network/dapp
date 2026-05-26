/**
 * Pin the exact `metadata_json` splice semantics the operator depends on.
 *
 * Regressions these tests would catch:
 *  - docker selection accidentally writing `"runtime_backend":"docker"` into
 *    the payload (operator's default — adding the field bloats job inputs
 *    and creates noisy diffs in the indexer).
 *  - Firecracker/TEE selection clobbering other user-authored fields (image,
 *    env, ports) instead of merging cleanly.
 *  - Aliases like `container`/`microvm`/`confidential` not being normalised
 *    back to the canonical operator-side token.
 *  - Invalid JSON being silently rewritten when the user toggles the
 *    selector (must stay verbatim until the user fixes parse errors).
 */

import { describe, expect, it } from 'vitest';
import {
  applyRuntimeBackendToMetadata,
  isMetadataJsonField,
  normalizeRuntimeBackend,
  parseMetadata,
  RUNTIME_BACKEND_DEFAULT,
} from './metadataJson';

describe('isMetadataJsonField', () => {
  it('matches exactly metadata_json', () => {
    expect(isMetadataJsonField('metadata_json')).toBe(true);
  });

  it('rejects camelCase, prefixes, suffixes', () => {
    expect(isMetadataJsonField('metadataJson')).toBe(false);
    expect(isMetadataJsonField('sandbox_metadata_json')).toBe(false);
    expect(isMetadataJsonField('metadata_json_v2')).toBe(false);
    expect(isMetadataJsonField('')).toBe(false);
  });
});

describe('normalizeRuntimeBackend', () => {
  it('canonicalises the operator-side aliases', () => {
    expect(normalizeRuntimeBackend('docker')).toBe('docker');
    expect(normalizeRuntimeBackend('container')).toBe('docker');
    expect(normalizeRuntimeBackend('firecracker')).toBe('firecracker');
    expect(normalizeRuntimeBackend('microvm')).toBe('firecracker');
    expect(normalizeRuntimeBackend('tee')).toBe('tee');
    expect(normalizeRuntimeBackend('confidential')).toBe('tee');
  });

  it('is case- and whitespace-insensitive', () => {
    expect(normalizeRuntimeBackend('  DOCKER ')).toBe('docker');
    expect(normalizeRuntimeBackend('MicroVM')).toBe('firecracker');
  });

  it('returns null for unknown / non-string values', () => {
    expect(normalizeRuntimeBackend('kata')).toBeNull();
    expect(normalizeRuntimeBackend('')).toBeNull();
    expect(normalizeRuntimeBackend(undefined)).toBeNull();
    expect(normalizeRuntimeBackend(42)).toBeNull();
    expect(normalizeRuntimeBackend({ runtime: 'docker' })).toBeNull();
  });
});

describe('parseMetadata', () => {
  it('treats empty input as ok+empty (operator falls back to defaults)', () => {
    const result = parseMetadata('   ');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.empty).toBe(true);
      expect(result.object).toBeNull();
    }
  });

  it('accepts JSON objects', () => {
    const result = parseMetadata('{"image":"x","env":{"FOO":"bar"}}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.empty).toBe(false);
      expect(result.object).toEqual({ image: 'x', env: { FOO: 'bar' } });
    }
  });

  it('rejects arrays and primitives', () => {
    expect(parseMetadata('[1,2]').ok).toBe(false);
    expect(parseMetadata('"just a string"').ok).toBe(false);
    expect(parseMetadata('42').ok).toBe(false);
    expect(parseMetadata('null').ok).toBe(false);
  });

  it('rejects malformed JSON with a helpful error', () => {
    const result = parseMetadata('{not: json}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/invalid json/i);
    }
  });
});

describe('applyRuntimeBackendToMetadata', () => {
  it('omits runtime_backend when docker (the operator default) is selected', () => {
    expect(applyRuntimeBackendToMetadata('', 'docker')).toBe('');
    expect(
      applyRuntimeBackendToMetadata(
        '{"runtime_backend":"firecracker"}',
        'docker',
      ),
    ).toBe('');
  });

  it('preserves the user-authored object body when picking firecracker', () => {
    const out = applyRuntimeBackendToMetadata(
      '{"image":"ghcr.io/agent:latest","env":{"FOO":"bar"}}',
      'firecracker',
    );
    const parsed = JSON.parse(out);
    expect(parsed).toEqual({
      image: 'ghcr.io/agent:latest',
      env: { FOO: 'bar' },
      runtime_backend: 'firecracker',
    });
  });

  it('overwrites a previous runtime_backend selection rather than appending', () => {
    const out = applyRuntimeBackendToMetadata(
      '{"runtime_backend":"firecracker","image":"x"}',
      'tee',
    );
    const parsed = JSON.parse(out);
    expect(parsed).toEqual({ runtime_backend: 'tee', image: 'x' });
  });

  it('seeds an object when starting from empty input + non-default backend', () => {
    const out = applyRuntimeBackendToMetadata('   ', 'tee');
    expect(JSON.parse(out)).toEqual({ runtime_backend: 'tee' });
  });

  it('leaves invalid JSON untouched so the user can fix parse errors', () => {
    const raw = '{ this is not json';
    expect(applyRuntimeBackendToMetadata(raw, 'firecracker')).toBe(raw);
    expect(applyRuntimeBackendToMetadata(raw, 'docker')).toBe(raw);
  });

  it('default constant is docker (matches operator default + UI default)', () => {
    expect(RUNTIME_BACKEND_DEFAULT).toBe('docker');
  });
});
