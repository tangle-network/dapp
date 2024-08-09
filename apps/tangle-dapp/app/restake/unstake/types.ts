export type UnstakeRequestTableData = {
  amount: number;
  amountRaw: bigint;
  assetId: string;
  assetSymbol: string;
  timeRemaining: number;
  operatorAccountId: string;
  operatorIdentityName?: string | null;
};
