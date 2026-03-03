import {
  SlashProposal,
  SlashProposerRole,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { ECDSA_PUBLIC_KEY_HEX_LENGTH } from './constants';

export const formatDateTime = (unixSeconds: bigint): string =>
  new Date(Number(unixSeconds) * 1000).toLocaleString();

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) {
    return 'Ready now';
  }

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.ceil((seconds % 3_600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return minutes <= 1 ? 'Less than a minute' : `${minutes} minutes`;
};

export const decodeBytes32Ascii = (value: `0x${string}`): string | null => {
  if (!value || value.length !== 66) {
    return null;
  }

  const hex = value.slice(2).toLowerCase();
  let decoded = '';

  for (let i = 0; i < hex.length; i += 2) {
    const byte = Number.parseInt(hex.slice(i, i + 2), 16);

    if (!Number.isFinite(byte)) {
      return null;
    }

    if (byte === 0) {
      break;
    }

    if (byte < 32 || byte > 126) {
      return null;
    }

    decoded += String.fromCharCode(byte);
  }

  const text = decoded.trim();
  return text.length > 0 ? text : null;
};

export const getSlashClaimContext = (slash: SlashProposal): string => {
  const cancelReason = slash.cancelReason?.trim();
  if (cancelReason) {
    return `Cancel reason: ${cancelReason}`;
  }

  const evidenceText = decodeBytes32Ascii(slash.evidence);
  if (evidenceText) {
    return `Claim: ${evidenceText}`;
  }

  return 'No human-readable reason on-chain';
};

export const getSlashDisputeMessage = (slash: SlashProposal): string | null => {
  const disputeReason = slash.disputeReason?.trim();
  return disputeReason ? disputeReason : null;
};

export const getSlashProposerRoleLabel = (role: SlashProposerRole): string => {
  if (role === 'ServiceOwner') {
    return 'Service Owner';
  }

  if (role === 'BlueprintOwner') {
    return 'Blueprint Owner';
  }

  if (role === 'SlashingOrigin') {
    return 'Slashing Origin';
  }

  return 'Authorized Proposer';
};

export const getSlashProposerRoleChipColor = (
  role: SlashProposerRole,
): 'green' | 'blue' | 'yellow' | 'dark-grey' => {
  if (role === 'ServiceOwner') {
    return 'green';
  }

  if (role === 'BlueprintOwner') {
    return 'blue';
  }

  if (role === 'SlashingOrigin') {
    return 'yellow';
  }

  return 'dark-grey';
};

export const isValidEcdsaPublicKey = (value: string): boolean =>
  /^0x[0-9a-fA-F]+$/.test(value) &&
  value.length === ECDSA_PUBLIC_KEY_HEX_LENGTH;

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
