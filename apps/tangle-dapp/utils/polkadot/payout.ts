import { AddressType } from '@webb-tools/dapp-config/types';

import { getPolkadotApiPromise } from './api';
import { getTxPromise } from './utils';

export const payoutStakers = async (
  nominatorAddress: string,
  validatorAddress: string,
  era: number
): Promise<AddressType> => {
  const api = await getPolkadotApiPromise();
  const tx = api.tx.staking.payoutStakers(validatorAddress, era);

  return getTxPromise(nominatorAddress, tx);
};

export const batchPayoutStakers = async (
  nominatorAddress: string,
  validatorEraPairs: { validatorAddress: string; era: string }[]
): Promise<AddressType> => {
  const api = await getPolkadotApiPromise();

  const tx = api.tx.utility.batch(
    validatorEraPairs.map(({ validatorAddress, era }) =>
      api.tx.staking.payoutStakers(validatorAddress, Number(era))
    )
  );

  return getTxPromise(nominatorAddress, tx);
};
