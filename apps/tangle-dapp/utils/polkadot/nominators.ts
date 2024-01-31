import type { HexString } from '@polkadot/util/types';

import { getPolkadotApiPromise } from './api';
import { getTxPromise } from './utils';

export const getTotalNumberOfNominators = async (
  validatorAddress: string
): Promise<number | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return NaN;

  const nominators = await api.query.staking.nominators.entries();
  const totalNominators = nominators.filter(([, nominatorData]) => {
    const nominations = nominatorData.unwrapOrDefault();
    return (
      nominations.targets &&
      nominations.targets.some(
        (target) => target.toString() === validatorAddress
      )
    );
  });
  const delegations = totalNominators.length.toString();

  return Number(delegations);
};

export const getValidatorIdentity = async (
  validatorAddress: string
): Promise<string | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return '';

  const identityOption = await api.query.identity.identityOf(validatorAddress);

  let name = '';

  if (identityOption.isSome) {
    const { info } = identityOption.unwrap();
    const displayNameInfo = info.display.toString();
    const displayNameObject = JSON.parse(displayNameInfo);

    if (displayNameObject.raw) {
      const hexString = displayNameObject.raw;
      name = Buffer.from(hexString.slice(2), 'hex').toString('utf8');
    }
  } else {
    name = validatorAddress;
  }

  return name;
};

export const getValidatorCommission = async (
  validatorAddress: string
): Promise<string | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return '';

  const validatorPrefs = await api.query.staking.validators(validatorAddress);
  const commissionRate = validatorPrefs.commission.unwrap().toNumber();
  const commission = commissionRate / 10000000;

  return commission.toString();
};

export const getMaxNominationQuota = async (): Promise<number | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return NaN;

  const maxNominations = await api.query.staking.maxNominatorsCount;

  return parseInt(maxNominations.toString());
};

export const nominateValidators = async (
  nominatorAddress: string,
  validatorAddresses: string[]
): Promise<HexString> => {
  const api = await getPolkadotApiPromise();
  if (!api) {
    throw new Error('Failed to get Polkadot API');
  }

  const tx = api.tx.staking.nominate(validatorAddresses);
  return getTxPromise(nominatorAddress, tx);
};

export const stopNomination = async (nominatorAddress: string) => {
  const api = await getPolkadotApiPromise();
  if (!api) {
    throw new Error('Failed to get Polkadot API');
  }

  const tx = api.tx.staking.chill();
  return getTxPromise(nominatorAddress, tx);
};
