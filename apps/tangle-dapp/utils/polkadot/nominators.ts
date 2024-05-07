import type { HexString } from '@polkadot/util/types';

import { getPolkadotApiPromise } from './api';
import { getAccountInfo } from './identity';
import { getTxPromise } from './utils';

export const getTotalNumberOfNominators = async (
  rpcEndpoint: string,
  validatorAddress: string
): Promise<number> => {
  const api = await getPolkadotApiPromise(rpcEndpoint);
  const nominators = await api.query.staking.nominators.entries();

  const totalNominators = nominators.filter(([, nominatorData]) => {
    if (nominatorData.isNone) {
      return false;
    }

    const nominations = nominatorData.unwrap();

    return (
      nominations.targets &&
      nominations.targets.some(
        (target) => target.toString() === validatorAddress
      )
    );
  });

  return totalNominators.length;
};

export const getValidatorIdentityName = async (
  rpcEndpoint: string,
  validatorAddress: string
): Promise<string> => {
  const validatorAccountInfo = await getAccountInfo(
    rpcEndpoint,
    validatorAddress
  );

  if (validatorAccountInfo?.name) {
    return validatorAccountInfo.name;
  }

  // Default the name to be the validator's address if the
  // validator has no identity set.
  return validatorAddress;
};

export const getValidatorCommission = async (
  rpcEndpoint: string,
  validatorAddress: string
): Promise<string> => {
  const api = await getPolkadotApiPromise(rpcEndpoint);
  const validatorPrefs = await api.query.staking.validators(validatorAddress);
  const commissionRate = validatorPrefs.commission.unwrap().toNumber();
  const commission = commissionRate / 10_000_000;

  return commission.toString();
};

export const getMaxNominationQuota = async (
  rpcEndpoint: string
): Promise<number | undefined> => {
  const api = await getPolkadotApiPromise(rpcEndpoint);
  const maxNominations = api.query.staking.maxNominatorsCount;

  return parseInt(maxNominations.toString());
};

export const nominateValidators = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  validatorAddresses: string[]
): Promise<HexString> => {
  const api = await getPolkadotApiPromise(rpcEndpoint);
  const tx = api.tx.staking.nominate(validatorAddresses);

  return getTxPromise(nominatorAddress, tx);
};

export const stopNomination = async (
  rpcEndpoint: string,
  nominatorAddress: string
) => {
  const api = await getPolkadotApiPromise(rpcEndpoint);
  const tx = api.tx.staking.chill();

  return getTxPromise(nominatorAddress, tx);
};
