import type { RewardClaimEntry } from './useRewards';
import { parseAddressOrThrow } from '../../utils/safeParseAddress';

export interface RewardClaimRow {
  id: string;
  account: string;
  token: string;
  amount: string;
  claimedAt: string;
  txHash: string;
}

export const mapRewardClaimRow = (claim: RewardClaimRow): RewardClaimEntry => ({
  id: claim.id,
  account: parseAddressOrThrow(
    claim.account,
    `RewardClaim(${claim.id}).account`,
  ),
  token: parseAddressOrThrow(claim.token, `RewardClaim(${claim.id}).token`),
  amount: BigInt(claim.amount),
  claimedAt: BigInt(claim.claimedAt),
  txHash: claim.txHash,
});
