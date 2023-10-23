import { getPolkadotApiPromise } from '../../constants';
import { MetricReturnType } from '../../types';

export const getActiveAndDelegationCount =
  async (): Promise<MetricReturnType> => {
    const api = await getPolkadotApiPromise();

    if (!api) return { value1: NaN, value2: NaN };

    try {
      const totalNominatorCount =
        await api.query.staking.counterForNominators();

      // Get the current active era
      const activeEra = await api.query.staking.activeEra();
      const currentEra = activeEra.unwrap().index;

      // Get the list of current validators
      const currentValidators = await api.query.session.validators();

      // Collection of unique nominator addresses - Set is used to avoid duplicates, as a nominator can nominate multiple validators
      const activeNominators = new Set<string>();

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
        value1: activeNominatorsCount,
        value2: totalNominatorCount.toNumber(),
      };
    } catch (e) {
      console.error(e);

      return { value1: NaN, value2: NaN };
    }
  };
