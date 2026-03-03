export const NATIVE_ASSET_ID = '0';

export const TxName = {
  STAKING_JOIN_OPERATORS: 'STAKING_JOIN_OPERATORS',
} as const;

export const SUCCESS_MESSAGES: Record<
  (typeof TxName)[keyof typeof TxName],
  string
> = {
  [TxName.STAKING_JOIN_OPERATORS]: 'Successfully joined operators.',
};
