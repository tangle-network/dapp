import { Validator } from '../../types';
import { getPolkadotApiPromise } from '../../utils/polkadot';
import { getValidatorDetails } from './getValidatorDetails';

export const getActiveValidators = async (): Promise<Validator[]> => {
  console.debug('Fetching ACTIVE validator data (this may stall the UI)');

  const api = await getPolkadotApiPromise();

  try {
    const activeValidatorAddresses = await api.query.session.validators();

    return Promise.all(
      activeValidatorAddresses.map(
        async (validatorAddress): Promise<Validator> =>
          getValidatorDetails(validatorAddress, 'Active')
      )
    );
  } catch (e) {
    console.error(e);

    return [];
  }
};
