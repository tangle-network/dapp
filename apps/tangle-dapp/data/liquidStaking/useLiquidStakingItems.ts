import { BN_ZERO } from '@polkadot/util';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  LiquidStakingChain,
  LS_NETWORK_CONFIG,
} from '../../constants/liquidStaking';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import {
  Collator,
  Dapp,
  LiquidStakingItem,
  Validator,
  VaultOrStakePool,
} from '../../types/liquidStaking';
import {
  fetchChainDecimals,
  fetchCollators,
  fetchDapps,
  fetchMappedCollatorInfo,
  fetchMappedDappsTotalValueStaked,
  fetchMappedIdentityNames,
  fetchMappedValidatorsCommission,
  fetchMappedValidatorsTotalValueStaked,
  fetchTokenSymbol,
  fetchValidators,
  fetchVaultsAndStakePools,
} from './helper';

const useLiquidStakingItems = (selectedChain: LiquidStakingChain) => {
  const {
    // valueOpt: liquidStakingTableData,
    setWithPreviousValue: setLiquidStakingTableData,
  } = useLocalStorage(LocalStorageKey.LIQUID_STAKING_TABLE_DATA, true);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<
    Validator[] | VaultOrStakePool[] | Dapp[] | Collator[]
  >([]);
  const dataType = useMemo(() => getDataType(selectedChain), [selectedChain]);

  // const cachedData = useMemo(
  //   () => liquidStakingTableData.value[selectedChain] || [],
  //   [liquidStakingTableData, selectedChain],
  // );
  // console.debug('cachedData', cachedData);

  const fetchData = useCallback(
    async (chain: LiquidStakingChain) => {
      const endpoint = LS_NETWORK_CONFIG[chain]?.endpoint;

      if (!endpoint) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      let fetchedItems: Validator[] | VaultOrStakePool[] | Dapp[] | Collator[] =
        [];

      switch (chain) {
        case LiquidStakingChain.POLKADOT:
          fetchedItems = await getValidators(endpoint);
          break;

        case LiquidStakingChain.ASTAR:
          fetchedItems = await getDapps(endpoint);
          break;

        case LiquidStakingChain.PHALA:
          fetchedItems = await getVaultsAndStakePools(endpoint);
          break;

        case LiquidStakingChain.MOONBEAM:
          fetchedItems = await getCollators(
            endpoint,
            LiquidStakingChain.MOONBEAM,
            'https://stakeglmr.com/',
          );
          break;

        case LiquidStakingChain.MANTA:
          fetchedItems = await getCollators(
            endpoint,
            LiquidStakingChain.MANTA,
            'https://manta.subscan.io/account/',
          );
          break;

        default:
          fetchedItems = [];
          break;
      }

      setItems(fetchedItems);
      setLiquidStakingTableData((prev) => ({
        ...prev?.value,
        [chain]: fetchedItems,
      }));
      setIsLoading(false);
    },
    [setLiquidStakingTableData],
  );

  useEffect(() => {
    setItems([]);
    setIsLoading(true);
    fetchData(selectedChain);
  }, [selectedChain, fetchData]);

  return {
    isLoading,
    data: items,
    dataType,
  };
};

export default useLiquidStakingItems;

const getDataType = (chain: LiquidStakingChain) => {
  switch (chain) {
    case LiquidStakingChain.MANTA:
      return LiquidStakingItem.COLLATOR;
    case LiquidStakingChain.MOONBEAM:
      return LiquidStakingItem.COLLATOR;
    case LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN:
    case LiquidStakingChain.POLKADOT:
      return LiquidStakingItem.VALIDATOR;
    case LiquidStakingChain.PHALA:
      return LiquidStakingItem.VAULT_OR_STAKE_POOL;
    case LiquidStakingChain.ASTAR:
      return LiquidStakingItem.DAPP;
  }
};

const getValidators = async (endpoint: string): Promise<Validator[]> => {
  const [
    validators,
    mappedIdentityNames,
    mappedTotalValueStaked,
    mappedCommission,
    chainDecimals,
    chainTokenSymbol,
  ] = await Promise.all([
    fetchValidators(endpoint),
    fetchMappedIdentityNames(endpoint),
    fetchMappedValidatorsTotalValueStaked(endpoint),
    fetchMappedValidatorsCommission(endpoint),
    fetchChainDecimals(endpoint),
    fetchTokenSymbol(endpoint),
  ]);

  return validators.map((val) => {
    const identityName = mappedIdentityNames.get(val.toString());
    const totalValueStaked = mappedTotalValueStaked.get(val.toString());
    const commission = mappedCommission.get(val.toString());

    return {
      id: val.toString(),
      validatorAddress: val.toString(),
      validatorIdentity: identityName || val.toString(),
      totalValueStaked: totalValueStaked || BN_ZERO,
      validatorAPY: 0,
      validatorCommission: commission || BN_ZERO,
      chain: LiquidStakingChain.POLKADOT,
      chainDecimals,
      chainTokenSymbol,
      itemType: LiquidStakingItem.VALIDATOR,
      href: `https://polkadot.subscan.io/account/${val.toString()}`,
    };
  });
};

const getDapps = async (endpoint: string): Promise<Dapp[]> => {
  const [
    dapps,
    mappedTotalValueStaked,
    chainDecimals,
    chainTokenSymbol,
    stakingDappsResponse,
  ] = await Promise.all([
    fetchDapps(endpoint),
    fetchMappedDappsTotalValueStaked(endpoint),
    fetchChainDecimals(endpoint),
    fetchTokenSymbol(endpoint),
    fetch('https://api.astar.network/api/v1/astar/dapps-staking/dapps'),
  ]);

  if (!stakingDappsResponse.ok) {
    throw new Error('Failed to fetch staking dapps');
  }

  const dappInfosArray = await stakingDappsResponse.json();
  const dappInfosMap = new Map(
    dappInfosArray.map((dappInfo: any) => [dappInfo.address, dappInfo]),
  );

  return dapps.map((dapp) => {
    const totalValueStaked = mappedTotalValueStaked.get(dapp.id);
    const dappInfo = dappInfosMap.get(dapp.address) as {
      name?: string;
      contractType?: string;
    };

    return {
      id: dapp.id,
      dappContractAddress: dapp.address,
      dappName: dappInfo ? dappInfo.name || dapp.address : dapp.address,
      dappContractType: dappInfo ? dappInfo.contractType || '' : '',
      commission: BN_ZERO,
      totalValueStaked: totalValueStaked || BN_ZERO,
      chain: LiquidStakingChain.ASTAR,
      chainDecimals,
      chainTokenSymbol,
      itemType: LiquidStakingItem.DAPP,
      href: `https://portal.astar.network/astar/dapp-staking/dapp?dapp=${dapp.address}`,
    };
  });
};

const getVaultsAndStakePools = async (
  endpoint: string,
): Promise<VaultOrStakePool[]> => {
  const [vaultsAndStakePools, chainDecimals, chainTokenSymbol] =
    await Promise.all([
      fetchVaultsAndStakePools(endpoint),
      fetchChainDecimals(endpoint),
      fetchTokenSymbol(endpoint),
    ]);

  return vaultsAndStakePools.map((val) => {
    const vaultOrStakePoolID = val.id;
    const type = val.type === 'vault' ? 'vault' : 'stake-pool';

    return {
      id: val.id,
      vaultOrStakePoolID: val.id,
      vaultOrStakePoolAccountID: val.accountId,
      vaultOrStakePoolName: val.id,
      commission: val.commission,
      totalValueStaked: val.totalValueStaked,
      chain: LiquidStakingChain.PHALA,
      chainDecimals,
      chainTokenSymbol,
      type,
      itemType: LiquidStakingItem.VAULT_OR_STAKE_POOL,
      href: `https://app.phala.network/phala/${type}/${vaultOrStakePoolID}`,
    };
  });
};

const getCollators = async (
  endpoint: string,
  chain: LiquidStakingChain,
  href: string,
): Promise<Collator[]> => {
  const [
    collators,
    mappedIdentityNames,
    mappedCollatorInfo,
    chainDecimals,
    chainTokenSymbol,
  ] = await Promise.all([
    fetchCollators(endpoint),
    fetchMappedIdentityNames(endpoint),
    fetchMappedCollatorInfo(endpoint),
    fetchChainDecimals(endpoint),
    fetchTokenSymbol(endpoint),
  ]);

  return collators.map((collator) => {
    const identityName = mappedIdentityNames.get(collator);
    const collatorInfo = mappedCollatorInfo.get(collator);

    let collatorExternalLink = '';

    if (chain === LiquidStakingChain.MOONBEAM) {
      collatorExternalLink = href;
    } else if (chain === LiquidStakingChain.MANTA) {
      collatorExternalLink = href + collator;
    }

    return {
      id: collator,
      collatorAddress: collator,
      collatorIdentity: identityName || collator,
      collatorDelegationCount: collatorInfo?.delegationCount || 0,
      totalValueStaked: collatorInfo?.totalStaked || BN_ZERO,
      chain,
      chainDecimals,
      chainTokenSymbol,
      itemType: LiquidStakingItem.COLLATOR,
      href: collatorExternalLink,
    };
  });
};
