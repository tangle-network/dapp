import { z } from 'zod';

import { BadgeEnum } from '../../types';

const LeaderboardAddressResponseSchema = z.object({
  id: z.number(),
  type: z.string(),
  address: z.string(),
});

export type AddressType = z.infer<typeof LeaderboardAddressResponseSchema>;

const LeaderboardParticipantResponseSchema = z.object({
  id: z.number(),
  points: z.number(),
  dateOfLastAction: z.string(),
  twitter: z.string().nullable(),
  email: z.string().nullable(),
  badges: z.array(z.nativeEnum(BadgeEnum)),
  addresses: z.array(LeaderboardAddressResponseSchema),
});

export type ParticipantType = z.infer<
  typeof LeaderboardParticipantResponseSchema
>;

const LeaderboardSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    skip: z.number(),
    limit: z.number(),
    total: z.number(),
    participants: z.array(LeaderboardParticipantResponseSchema),
  }),
});

export type LeaderboardSuccessResponseType = z.infer<
  typeof LeaderboardSuccessResponseSchema
>;

const LeaderboardFailedResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export type LeaderboardFailedResponseType = z.infer<
  typeof LeaderboardFailedResponseSchema
>;

export const LeaderboardResponseSchema = z.discriminatedUnion('success', [
  LeaderboardSuccessResponseSchema,
  LeaderboardFailedResponseSchema,
]);

export type LeaderboardResponseType = z.infer<typeof LeaderboardResponseSchema>;
