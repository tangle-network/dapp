import { Validator } from '../../types';
import { getPolkadotApiPromise } from '../../utils/polkadot';
import { getValidatorDetails } from './getValidatorDetails';

export const getWaitingValidators = async (): Promise<Validator[]> => {
  console.debug('Fetching WAITING validator data (this may stall the UI)');

  const api = await getPolkadotApiPromise();

  try {
    const waitingValidatorsInfo = await api.derive.staking.waitingInfo();

    const waitingValidatorAddresses = await Promise.all(
      waitingValidatorsInfo.info.map((validator) => validator.accountId)
    );

    return Promise.all(
      waitingValidatorAddresses.map(
        async (validator): Promise<Validator> =>
          getValidatorDetails(validator, 'Waiting')
      )
    );
  } catch (e) {
    console.error(e);

    return [];
  }
};
