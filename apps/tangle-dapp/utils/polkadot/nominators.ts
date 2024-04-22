import { getApiPromise } from './api';
import { extractDataFromIdentityInfo, IdentityDataType } from './identity';

export const getValidatorIdentityName = async (
  rpcEndpoint: string,
  validatorAddress: string
): Promise<string> => {
  const api = await getApiPromise(rpcEndpoint);
  const identityOpt = await api.query.identity.identityOf(validatorAddress);

  // If the identity is set, get the custom display name
  // and use that as the name instead of the address.
  if (identityOpt.isSome) {
    const identity = identityOpt.unwrap();
    const info = identity[0].info;
    const displayName = extractDataFromIdentityInfo(
      info,
      IdentityDataType.NAME
    );

    if (displayName !== null) {
      return displayName;
    }
  }

  // Default the name to be the validator's address if the
  // validator has no identity set.
  return validatorAddress;
};

export const getValidatorCommission = async (
  rpcEndpoint: string,
  validatorAddress: string
): Promise<string> => {
  const api = await getApiPromise(rpcEndpoint);
  const validatorPrefs = await api.query.staking.validators(validatorAddress);
  const commissionRate = validatorPrefs.commission.unwrap().toNumber();
  const commission = commissionRate / 10_000_000;

  return commission.toString();
};
