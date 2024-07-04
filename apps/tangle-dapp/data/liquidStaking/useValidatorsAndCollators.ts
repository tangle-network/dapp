import { BN_ZERO } from '@polkadot/util';
import { useEffect, useState } from 'react';

import {
  LiquidStakingChain,
  LS_NETWORK_CONFIG,
} from '../../constants/liquidStaking';
import { Collator, Validator } from '../../types/liquidStaking';
import {
  fetchChainDecimals,
  fetchCollators,
  fetchMappedCommission,
  fetchMappedIdentityNames,
  fetchMappedTotalValueStaked,
  fetchTokenSymbol,
  fetchValidators,
} from './helper';
import { useLiquidStakingStore } from './store';

const useValidatorsAndCollators = (): {
  isLoading: boolean;
  data: {
    validators: Validator[];
    collators: Collator[];
  };
} => {
  const { selectedChain } = useLiquidStakingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [Validators, setValidators] = useState<Validator[]>([]);
  const [Collators, setCollators] = useState<Collator[]>([]);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async (chain: LiquidStakingChain) => {
      const endpoint = LS_NETWORK_CONFIG[chain].endpoint;

      if (!endpoint) {
        setValidators([]);
        setIsLoading(false);
        return;
      }

      let allValidators: Validator[] = [];
      let allCollators: Collator[] = [];

      switch (chain) {
        case LiquidStakingChain.POLKADOT:
          allValidators = await getPolkadotMainnetValidators(endpoint);
          break;

        case LiquidStakingChain.PHALA:
          allCollators = await getPhalaCollators(endpoint);
          break;

        default:
          break;
      }

      setValidators(allValidators);
      setCollators(allCollators);
      setIsLoading(false);
    };

    fetchData(selectedChain);
  }, [selectedChain]);

  return {
    isLoading,
    data: {
      validators: Validators,
      collators: Collators,
    },
  };
};

export default useValidatorsAndCollators;

// Polkadot Mainnet Validators
const getPolkadotMainnetValidators = async (
  endpoint: string,
): Promise<Validator[]> => {
  const validators = await fetchValidators(endpoint);
  const mappedIdentityNames = await fetchMappedIdentityNames(endpoint);
  const mappedTotalValueStaked = await fetchMappedTotalValueStaked(endpoint);
  const chainDecimals = await fetchChainDecimals(endpoint);
  const tokenSymbol = await fetchTokenSymbol(endpoint);
  const mappedCommission = await fetchMappedCommission(endpoint);

  return validators.map((val) => {
    const identityName = mappedIdentityNames.get(val.toString());
    const totalValueStaked = mappedTotalValueStaked.get(val.toString());
    const commission = mappedCommission.get(val.toString());

    return {
      address: val.toString(),
      identity: identityName ? identityName : val.toString(),
      totalValueStaked: totalValueStaked ? totalValueStaked : BN_ZERO,
      annualPercentageYield: 0,
      commission: commission ? commission : BN_ZERO,
      chain: LiquidStakingChain.POLKADOT,
      chainDecimals: chainDecimals,
      tokenSymbol: tokenSymbol,
    };
  });
};

// Phala Collators
const getPhalaCollators = async (endpoint: string): Promise<Collator[]> => {
  const collators = await fetchCollators(endpoint);
  const mappedIdentityNames = await fetchMappedIdentityNames(endpoint);
  const chainDecimals = await fetchChainDecimals(endpoint);
  const tokenSymbol = await fetchTokenSymbol(endpoint);

  return collators.map((col) => {
    const identityName = mappedIdentityNames.get(col.toString());

    return {
      address: col.accountId.toString(),
      identity: identityName ? identityName : col.accountId.toString(),
      chain: LiquidStakingChain.PHALA,
      chainDecimals: chainDecimals,
      tokenSymbol: tokenSymbol,
    };
  });
};
