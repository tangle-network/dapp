import { Validator } from '../../types';
import { getPolkadotApiPromise } from '../../utils/polkadot';
import { getValidatorDetails } from './getValidatorDetails';

export const getActiveValidators = async (
  rpcEndpoint: string
): Promise<Validator[]> => {
  console.debug('Fetching ACTIVE validator data (this may stall the UI)');

  const api = await getPolkadotApiPromise(rpcEndpoint);

  try {
    const activeValidatorAddresses = await api.query.session.validators();

    return Promise.all(
      activeValidatorAddresses.map(
        async (validatorAddress): Promise<Validator> =>
          getValidatorDetails(rpcEndpoint, validatorAddress, 'Active')
      )
    );
  } catch (error) {
    console.error(error);

    return [];
  }
};
