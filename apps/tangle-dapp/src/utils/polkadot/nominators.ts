import { getApiPromise } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import { getAccountInfo } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';

export const getValidatorIdentityName = async (
  rpcEndpoints: string[],
  validatorAddress: string,
): Promise<string> => {
  const validatorAccountInfo = await getAccountInfo(
    rpcEndpoints,
    validatorAddress,
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
  validatorAddress: string,
): Promise<string> => {
  const api = await getApiPromise(rpcEndpoint);
  const validatorPrefs = await api.query.staking.validators(validatorAddress);
  const commissionRate = validatorPrefs.commission.unwrap().toNumber();
  const commission = commissionRate / 10_000_000;

  return commission.toString();
};
