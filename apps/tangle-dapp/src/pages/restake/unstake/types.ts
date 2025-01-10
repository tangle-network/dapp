import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

export type UnstakeRequestTableData = {
  amount: string;
  amountRaw: bigint;
  assetId: string;
  assetSymbol: string;
  timeRemaining: number;
  operatorAccountId: SubstrateAddress;
  operatorIdentityName?: string | null;
};
