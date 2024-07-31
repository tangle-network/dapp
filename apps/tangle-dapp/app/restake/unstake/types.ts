export type UnstakeRequestTableData = {
  amount: number;
  assetId: string;
  assetSymbol: string;
  timeRemaining: number;
  operatorAccountId: string;
  operatorIdentityName?: string | null;
};
