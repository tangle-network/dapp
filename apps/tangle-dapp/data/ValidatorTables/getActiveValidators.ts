import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getTotalNumberOfNominators,
  getValidatorCommission,
  getValidatorIdentity,
} from '../../constants';
import { Validator } from '../../types';

export const getActiveValidators = async (): Promise<Validator[]> => {
  const api = await getPolkadotApiPromise();

  if (!api) return [] as Validator[];

  try {
    const [validators, currentEra] = await Promise.all([
      api.query.session.validators(),
      api.query.staking.currentEra(),
    ]);

    const validatorDetails = await Promise.all(
      validators.map(async (validator): Promise<Validator> => {
        // Validator Address
        const address = validator.toString();

        // Validator Identity
        const identity = await getValidatorIdentity(address);

        // Self Staked Amount & Effective Amount Staked
        const exposure = await api.query.staking.erasStakers(
          currentEra.unwrap(),
          address
        );
        // Self Staked Amount
        const selfStakedAmount = exposure.own.unwrap();
        const selfStaked = await formatTokenBalance(selfStakedAmount);
        // Effective Amount Staked (Total)
        const totalStakeAmount = exposure.total.unwrap();
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
        };
      })
    );

    return validatorDetails;
  } catch (e) {
    console.error(e);
    return [] as Validator[];
  }
};
