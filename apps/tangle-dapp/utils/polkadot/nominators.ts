import type { HexString } from '@polkadot/util/types';

import { getPolkadotApiPromise } from './api';
import { getTxPromise } from './utils';

export const getTotalNumberOfNominators = async (
  validatorAddress: string
): Promise<number> => {
  const api = await getPolkadotApiPromise();
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

export const getValidatorIdentity = async (
  validatorAddress: string
): Promise<string> => {
  const api = await getPolkadotApiPromise();
  const identityOption = await api.query.identity.identityOf(validatorAddress);

  // Default the name to be the validator's address.
  let name = validatorAddress;

  // If the identity is set, get the custom display name
  // and use that as the name instead of the address.
  if (identityOption.isSome) {
    const { info } = identityOption.unwrap();
    const displayNameInfo = info.display.toString();

    const displayNameObject: { raw?: `0x${string}` } =
      JSON.parse(displayNameInfo);

    if (displayNameObject.raw !== undefined) {
      const hexString = displayNameObject.raw;

      name = Buffer.from(hexString.slice(2), 'hex').toString('utf8');
    }
  }

  return name;
};

export const getValidatorCommission = async (
  validatorAddress: string
): Promise<string> => {
  const api = await getPolkadotApiPromise();
  const validatorPrefs = await api.query.staking.validators(validatorAddress);
  const commissionRate = validatorPrefs.commission.unwrap().toNumber();
  const commission = commissionRate / 10_000_000;

  return commission.toString();
};

export const getMaxNominationQuota = async (): Promise<number | undefined> => {
  const api = await getPolkadotApiPromise();
  const maxNominations = api.query.staking.maxNominatorsCount;

  return parseInt(maxNominations.toString());
};

export const nominateValidators = async (
  nominatorAddress: string,
  validatorAddresses: string[]
): Promise<HexString> => {
  const api = await getPolkadotApiPromise();
  const tx = api.tx.staking.nominate(validatorAddresses);

  return getTxPromise(nominatorAddress, tx);
};

export const stopNomination = async (nominatorAddress: string) => {
  const api = await getPolkadotApiPromise();
  const tx = api.tx.staking.chill();

  return getTxPromise(nominatorAddress, tx);
};
