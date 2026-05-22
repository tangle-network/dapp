import type { Hex } from 'viem';

/**
 * State carried between wizard steps. Each step mutates a slice via its own
 * setters; the dialog owns the canonical object and passes it down.
 *
 * `pinMode === 'sha256-only'` is the "I already pinned this file elsewhere"
 * shortcut: the user pastes a sha256 they trust, and the wizard skips the
 * file-hash step entirely. We still require a URI in step 2 because the
 * on-chain `BinaryVersion.binaryUri` field is non-optional.
 */
export type SourceMode = 'file' | 'sha256-only';

export type HostingMode = 'paste-ipfs' | 'pin-web3-storage' | 'github-raw';

export type AttestationMode = 'skip' | 'upload-bundle' | 'hash-from-url';

export interface WizardState {
  // Step 1
  sourceMode: SourceMode;
  binaryFile: File | null;
  binaryHash: Hex | null;
  isHashing: boolean;

  // Step 2
  hostingMode: HostingMode;
  binaryUri: string;
  pinError: string | null;
  isPinning: boolean;
  web3StorageToken: string;

  // Step 3
  attestationMode: AttestationMode;
  attestationFile: File | null;
  attestationHash: Hex;
  attestationUrl: string;

  // Step 4 (publish)
  // owned by the contract write hook, no local state needed beyond txHash
}

export const ZERO_BYTES32: Hex =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

export const initialWizardState = (): WizardState => ({
  sourceMode: 'file',
  binaryFile: null,
  binaryHash: null,
  isHashing: false,
  hostingMode: 'paste-ipfs',
  binaryUri: '',
  pinError: null,
  isPinning: false,
  web3StorageToken: '',
  attestationMode: 'skip',
  attestationFile: null,
  attestationHash: ZERO_BYTES32,
  attestationUrl: '',
});

export const WIZARD_STEPS = [
  { id: 1, title: 'Binary' },
  { id: 2, title: 'Hosting' },
  { id: 3, title: 'Attestation' },
  { id: 4, title: 'Review' },
  { id: 5, title: 'Notify' },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id'];

export const isValidIpfsUri = (uri: string): boolean =>
  /^ipfs:\/\/[A-Za-z0-9]/.test(uri);

export const isValidHttpsUri = (uri: string): boolean =>
  /^https:\/\/[^\s]+$/.test(uri);

export const isPlausibleBinaryUri = (uri: string): boolean => {
  const trimmed = uri.trim();
  if (trimmed.length === 0) return false;
  return isValidIpfsUri(trimmed) || isValidHttpsUri(trimmed);
};

export const isValidSha256Hex = (h: string): h is Hex =>
  /^0x[0-9a-fA-F]{64}$/.test(h);

/**
 * URL host check for the "is this a github raw URL?" hint.
 * Parsed via the URL API rather than substring-matching the input string,
 * which would have let `https://attacker.com/raw.githubusercontent.com/...`
 * pass. Returns false on any URL parse failure or non-https scheme.
 */
export const isGithubRawHost = (uri: string): boolean => {
  try {
    const u = new URL(uri);
    return (
      u.protocol === 'https:' && u.hostname === 'raw.githubusercontent.com'
    );
  } catch {
    return false;
  }
};
