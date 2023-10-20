import { getPolkadotApi } from '../../constants';

interface ActiveAndDelegationCount {
  active: number;
  delegation: number;
}

export const getActiveAndDelegationCount =
  async (): Promise<ActiveAndDelegationCount> => {
    const api = await getPolkadotApi();

    if (!api) return { active: NaN, delegation: NaN };

    try {
      const totalNominatorCount =
        await api.query.staking.counterForNominators();

      // Get the current active era
      const activeEra = await api.query.staking.activeEra();
      const currentEra = activeEra.unwrap().index;

      // Get the list of current validators
      const currentValidators = await api.query.session.validators();

      // Collection of unique nominator addresses - Set is used to avoid duplicates, as a nominator can nominate multiple validators
      const activeNominators = new Set();

      // For each validator, get their nominators
      for (const validator of currentValidators) {
        const exposure = await api.query.staking.erasStakers(
          currentEra,
          validator
        );
        for (const nominator of exposure.others) {
          activeNominators.add(nominator.who.toString());
        }
      }

      const activeNominatorsCount = activeNominators.size;

      return {
        active: activeNominatorsCount,
        delegation: Number(totalNominatorCount.toString()),
      };
    } catch (e: any) {
      console.error(e);

      return { active: NaN, delegation: NaN };
    }
  };
