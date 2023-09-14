import { useState, useEffect } from 'react';
import { useStatsContext } from '../stats-provider';

const getAuthorityReputations = async (currentAuthorities: any, api: any) => {
  const promises = currentAuthorities.map(async (item: any) => {
    const reputation = await api.query.dkg.authorityReputations(item);
    return {
      authority: item,
      reputation: reputation.toString(),
    };
  });

  const authorityReputations = await Promise.all(promises);
  return authorityReputations;
};

/**
 * Fetches the reputation scores of all authorities
 *
 * @returns an object with the following properties:
 * - authorityReputations: an array of objects with the following properties: authority - (authority's address) & reputation - (authority's reputation score)
 * - highestReputationScore: the highest reputation score among all authorities
 */
export const useReputations = () => {
  const {
    api,
    dkgDataFromPolkadotAPI: { currentAuthorities },
  } = useStatsContext();

  const [authorityReputations, setAuthorityReputations] = useState<any[]>([]);
  const [highestReputationScore, setHighestReputationScore] = useState<number>(
    -Infinity
  );

  useEffect(() => {
    const fetchReputations = async () => {
      const reputations = await getAuthorityReputations(
        currentAuthorities,
        api
      );

      const maxReputation = reputations.reduce((max, entry) => {
        const reputationValue = Number(entry.reputation);
        return reputationValue > max ? reputationValue : max;
      }, -Infinity);

      setAuthorityReputations(reputations);
      setHighestReputationScore(maxReputation);
    };

    fetchReputations();
  }, [api, currentAuthorities]);

  return {
    authorityReputations: authorityReputations,
    highestReputationScore: highestReputationScore,
  };
};
