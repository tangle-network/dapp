import { BN_ZERO } from '@polkadot/util';
import { useEffect, useState } from 'react';

import {
  LiquidStakingChain,
  LS_NETWORK_CONFIG,
} from '../../constants/liquidStaking';
import { Validator } from '../../types/liquidStaking';
import { getApiPromise } from '../../utils/polkadot';
import useCurrentEra from '../staking/useCurrentEra';
import { useLiquidStakingStore } from './store';

const useValidators = (): {
  isLoading: boolean;
  data: Validator[];
} => {
  const { result: currentEra } = useCurrentEra();
  const { selectedChain } = useLiquidStakingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [Validators, setValidators] = useState<Validator[]>([]);

  useEffect(() => {
    console.debug('Fetching Validators for chain:', selectedChain);
    setIsLoading(true);

    if (!currentEra) return;

    fetchValidators(selectedChain).then((validators) => {
      setValidators(validators);
      setIsLoading(false);
    });
  }, [currentEra, selectedChain]);

  return {
    isLoading,
    data: Validators,
  };
};

export default useValidators;

async function fetchValidators(
  chain: LiquidStakingChain,
): Promise<Validator[]> {
  const network = LS_NETWORK_CONFIG[chain];

  if (!network.endpoint) {
    return [];
  }

  const api = await getApiPromise(network.endpoint);
  const validators = await api.query.session.validators();

  const validatorData = await Promise.all(
    validators.map(async (val) => {
      const validatorId = val.toString();
      const validatorTotalStake = BN_ZERO;

      return {
        address: validatorId,
        identity: validatorId,
        totalValueStaked: validatorTotalStake,
        annualPercentageYield: 0,
        commission: 0,
        tokenSymbol: network.tokenSymbol,
      };
    }),
  );

  return validatorData;
}
