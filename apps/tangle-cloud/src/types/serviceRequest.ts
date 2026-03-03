import { Address } from 'viem';

export enum MembershipModel {
  Fixed = 0,
  Dynamic = 1,
}

export type OperatorApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface OperatorWithStatus {
  address: Address;
  status: OperatorApprovalStatus;
}

export const getMembershipLabel = (membership: MembershipModel): string => {
  switch (membership) {
    case MembershipModel.Fixed:
      return 'Fixed';
    case MembershipModel.Dynamic:
      return 'Dynamic';
    default:
      return 'Unknown';
  }
};

export const formatTtl = (ttlSeconds: bigint): string => {
  const seconds = Number(ttlSeconds);

  if (seconds === 0) {
    return 'No expiry';
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) {
    return hours > 0
      ? `${days}d ${hours}h`
      : `${days} day${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};

export const formatCreatedAt = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};
