import { ApiPromise } from '@polkadot/api';
import Decimal from 'decimal.js';

import { getTransferable } from '../../../../utils/polkadot/balance';

export async function getSubstrateNativeTransferable(params?: {
  api: ApiPromise;
  accAddress: string;
}): Promise<Decimal | null> {
  if (!params) return null;
  const { api, accAddress } = params;
  const accInfo = (await api.query.system.account(accAddress)).data;
  const transferable = getTransferable(accInfo);

  // Convert to the right format based on the chain's decimals
  return new Decimal(transferable.toString()).div(
    Decimal.pow(10, api.registry.chainDecimals[0]),
  );
}
