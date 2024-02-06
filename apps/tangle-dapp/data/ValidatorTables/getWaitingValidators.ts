import { Validator } from '../../types';
import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getTotalNumberOfNominators,
  getValidatorCommission,
  getValidatorIdentity,
} from '../../utils/polkadot';

export const getWaitingValidators = async (): Promise<Validator[]> => {
  const api = await getPolkadotApiPromise();

  try {
    const waitingValidatorsDetails = await api.derive.staking.waitingInfo();

    const waitingValidators = await Promise.all(
      waitingValidatorsDetails.info.map((validator) => {
        const address = validator.accountId;

        return address;
      })
    );

    const waitingValidatorDetails = await Promise.all(
      waitingValidators.map(async (validator): Promise<Validator> => {
        const validatorDetails = await api.query.staking.ledger(validator);

        // Validator Address
        const address = validator.toString();

        // Validator Identity
        const identity = await getValidatorIdentity(address);

        // Self Staked Amount
        const selfStakedAmount = validatorDetails.unwrap().active.unwrap();
        const selfStaked = await formatTokenBalance(selfStakedAmount);

        // Effective Amount Staked (Total)
        const totalStakeAmount = validatorDetails.unwrap().total.unwrap();
        const effectiveAmountStaked = await formatTokenBalance(
          totalStakeAmount
        );

        // Delegations (Total # of Nominators)
        const delegationsValue = await getTotalNumberOfNominators(address);
        const delegations = delegationsValue?.toString();

        // Commission
        const commission = await getValidatorCommission(address);

        return {
          address: address ?? '',
          identity: identity ?? '',
          selfStaked: selfStaked ?? '',
          effectiveAmountStaked: effectiveAmountStaked ?? '',
          effectiveAmountStakedRaw: totalStakeAmount.toString() ?? '',
          delegations: delegations ?? '',
          commission: commission ?? '',
          status: 'Waiting',
        };
      })
    );

    return waitingValidatorDetails;
  } catch (e) {
    console.error(e);
    return [] as Validator[];
  }
};
