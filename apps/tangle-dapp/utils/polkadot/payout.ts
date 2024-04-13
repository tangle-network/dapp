import { AddressType } from '@webb-tools/dapp-config/types';

import { getApiPromise } from './api';
import { getTxPromise } from './utils';

export const payoutStakers = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  validatorAddress: string,
  era: number
): Promise<AddressType> => {
  const api = await getApiPromise(rpcEndpoint);
  const tx = api.tx.staking.payoutStakers(validatorAddress, era);

  return getTxPromise(nominatorAddress, tx);
};

export const batchPayoutStakers = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  validatorEraPairs: { validatorAddress: string; era: string }[]
): Promise<AddressType> => {
  const api = await getApiPromise(rpcEndpoint);

  const tx = api.tx.utility.batch(
    validatorEraPairs.map(({ validatorAddress, era }) =>
      api.tx.staking.payoutStakers(validatorAddress, Number(era))
    )
  );

  return getTxPromise(nominatorAddress, tx);
};
