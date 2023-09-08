type DepositOrWithdrawalDataType = { [epoch: string]: bigint };

export type VolumeDataType = {
  [epoch: string]: { deposit: number; withdrawal: number };
};
