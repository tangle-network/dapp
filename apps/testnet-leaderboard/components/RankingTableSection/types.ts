import { z } from 'zod';

import { BadgeEnum } from '../../types';

const LeaderboardAddressResponseSchema = z.object({
  id: z.number(),
  type: z.string(),
  address: z.string(),
});

export type AddressType = z.infer<typeof LeaderboardAddressResponseSchema>;

const LeaderboardSessionsResponseSchema = z
  .object({
    [BadgeEnum.ACTIVE_VALIDATOR]: z.coerce.number().array(),
    [BadgeEnum.AUTHORITY]: z.coerce.number().array(),
    [BadgeEnum.VALIDATOR]: z.coerce.number().array(),
  })
  .nullable()
  .default(null);

export type SessionsType = z.infer<typeof LeaderboardSessionsResponseSchema>;

const LeaderboardIdenityResponseSchema = z
  .object({
    info: z.object({
      display: z.string(),
      email: z.string(),
      legal: z.string(),
      pgpFingerprint: z.string(),
      riot: z.string(),
      twitter: z.string(),
      web: z.string(),
    }),
  })
  .nullable()
  .default(null);

export type IdentityType = z.infer<typeof LeaderboardIdenityResponseSchema>;

const LeaderboardParticipantResponseSchema = z.object({
  id: z.number(),
  points: z.number(),
  twitter: z.string().nullable(),
  email: z.string().nullable(),
  badges: z.array(z.nativeEnum(BadgeEnum)),
  addresses: z.array(LeaderboardAddressResponseSchema),
  sessions: LeaderboardSessionsResponseSchema,
  identity: LeaderboardIdenityResponseSchema,
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
