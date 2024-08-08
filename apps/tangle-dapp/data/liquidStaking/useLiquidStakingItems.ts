import { BN_ZERO } from '@polkadot/util';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  PARACHAIN_CHAIN_MAP,
  ParachainChainId,
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

const useLiquidStakingItems = (selectedChain: ParachainChainId) => {
  const { setWithPreviousValue: setLiquidStakingTableData } = useLocalStorage(
    LocalStorageKey.LIQUID_STAKING_TABLE_DATA,
  );

  const [isLoading, setIsLoading] = useState(false);

  const [items, setItems] = useState<
    Validator[] | VaultOrStakePool[] | Dapp[] | Collator[]
  >([]);

  const dataType = useMemo(() => getDataType(selectedChain), [selectedChain]);

  const fetchData = useCallback(
    async (chain: ParachainChainId) => {
      const endpoint = PARACHAIN_CHAIN_MAP[chain]?.rpcEndpoint;

      if (!endpoint) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      let fetchedItems: Validator[] | VaultOrStakePool[] | Dapp[] | Collator[] =
        [];

      switch (chain) {
        case ParachainChainId.POLKADOT:
          fetchedItems = await getValidators(endpoint);
          break;

        case ParachainChainId.ASTAR:
          fetchedItems = await getDapps(endpoint);
          break;

        case ParachainChainId.PHALA:
          fetchedItems = await getVaultsAndStakePools(endpoint);
          break;

        case ParachainChainId.MOONBEAM:
          fetchedItems = await getCollators(
            endpoint,
            ParachainChainId.MOONBEAM,
            'https://stakeglmr.com/',
          );
          break;

        case ParachainChainId.MANTA:
          fetchedItems = await getCollators(
            endpoint,
            ParachainChainId.MANTA,
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

  // Whenever the selected chain changes, fetch the data for the new chain
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

const getDataType = (chain: ParachainChainId) => {
  switch (chain) {
    case ParachainChainId.MANTA:
      return LiquidStakingItem.COLLATOR;
    case ParachainChainId.MOONBEAM:
      return LiquidStakingItem.COLLATOR;
    case ParachainChainId.TANGLE_RESTAKING_PARACHAIN:
    case ParachainChainId.POLKADOT:
      return LiquidStakingItem.VALIDATOR;
    case ParachainChainId.PHALA:
      return LiquidStakingItem.VAULT_OR_STAKE_POOL;
    case ParachainChainId.ASTAR:
      return LiquidStakingItem.DAPP;
    default:
      return LiquidStakingItem.VALIDATOR;
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
      chainId: ParachainChainId.POLKADOT,
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
      chainId: ParachainChainId.ASTAR,
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
      chainId: ParachainChainId.PHALA,
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
  chainId: ParachainChainId,
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

    if (chainId === ParachainChainId.MOONBEAM) {
      collatorExternalLink = href;
    } else if (chainId === ParachainChainId.MANTA) {
      collatorExternalLink = href + collator;
    }

    return {
      id: collator,
      collatorAddress: collator,
      collatorIdentity: identityName || collator,
      collatorDelegationCount: collatorInfo?.delegationCount || 0,
      totalValueStaked: collatorInfo?.totalStaked || BN_ZERO,
      chainId,
      chainDecimals,
      chainTokenSymbol,
      itemType: LiquidStakingItem.COLLATOR,
      href: collatorExternalLink,
    };
  });
};
