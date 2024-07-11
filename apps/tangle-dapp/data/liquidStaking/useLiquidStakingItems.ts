import { BN_ZERO } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';

import {
  LiquidStakingChain,
  LS_NETWORK_CONFIG,
} from '../../constants/liquidStaking';
import {
  Dapp,
  LiquidStakingItem,
  Validator,
  VaultOrStakePool,
} from '../../types/liquidStaking';
import {
  fetchChainDecimals,
  fetchMappedCommission,
  fetchMappedIdentityNames,
  fetchMappedTotalValueStaked,
  fetchTokenSymbol,
  fetchValidators,
} from './helper';
import { useLiquidStakingStore } from './store';

const useLiquidStakingItems = (): {
  isLoading: boolean;
  data: Validator[] | VaultOrStakePool[] | Dapp[];
  dataType: LiquidStakingItem;
} => {
  const { selectedChain } = useLiquidStakingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<Validator[] | VaultOrStakePool[] | Dapp[]>(
    [],
  );

  const dataType = useMemo(() => getDataType(selectedChain), [selectedChain]);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async (chain: LiquidStakingChain) => {
      const endpoint = LS_NETWORK_CONFIG[chain].endpoint;

      if (!endpoint) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      let items: Validator[] | VaultOrStakePool[] | Dapp[] = [];

      switch (chain) {
        case LiquidStakingChain.POLKADOT:
          items = await getPolkadotMainnetValidators(endpoint);
          break;

        default:
          break;
      }

      setItems(items);
      setIsLoading(false);
    };

    fetchData(selectedChain);
  }, [selectedChain]);

  return {
    isLoading,
    data: items,
    dataType,
  };
};

export default useLiquidStakingItems;

const getDataType = (chain: LiquidStakingChain): LiquidStakingItem => {
  switch (chain) {
    case LiquidStakingChain.MANTA:
    case LiquidStakingChain.MOONBEAM:
    case LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN:
    case LiquidStakingChain.POLKADOT:
      return LiquidStakingItem.VALIDATOR;
    case LiquidStakingChain.PHALA:
      return LiquidStakingItem.VAULT_OR_STAKE_POOL;
    case LiquidStakingChain.ASTAR:
      return LiquidStakingItem.DAPP;
  }
};

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
      id: val.toString(),
      validatorAddress: val.toString(),
      validatorIdentity: identityName ? identityName : val.toString(),
      totalValueStaked: totalValueStaked ? totalValueStaked : BN_ZERO,
      validatorAPY: 0,
      validatorCommission: commission ? commission : BN_ZERO,
      chain: LiquidStakingChain.POLKADOT,
      chainDecimals: chainDecimals,
      chainTokenSymbol: tokenSymbol,
    };
  });
};
