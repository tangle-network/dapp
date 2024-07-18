import { Option } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import { BN, BN_ZERO } from '@polkadot/util';

import {
  PalletDappStakingV3ContractStakeAmount,
  PalletDappStakingV3DAppInfo,
} from '../../types/astarDappStaking';
import { getApiPromise } from '../../utils/polkadot';

export const fetchValidators = async (
  rpcEndpoint: string,
): Promise<AccountId32[]> => {
  const api = await getApiPromise(rpcEndpoint);
  const validators = (await api.query.session.validators()).map((val) => val);
  return validators;
};

export const fetchMappedValidatorsIdentityNames = async (
  rpcEndpoint: string,
): Promise<Map<string, string>> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.identity) {
    throw new Error('identity pallet is not available in the runtime');
  }

  const identityNames = await api.query.identity.identityOf.entries();

  const map = new Map<string, string>();

  identityNames.forEach((identity) => {
    if (!identity[1].unwrap()[0]) {
      return;
    }

    const validator = identity[0].args[0];
    const info = identity[1].unwrap()[0].info;
    let displayName = validator.toString();
    if (info) {
      const displayData = info['display'];
      if (displayData.isNone) return null;
      const displayDataObject: { raw?: string } = JSON.parse(
        displayData.toString(),
      );
      if (displayDataObject.raw !== undefined) {
        const hexString = displayDataObject.raw;
        displayName = Buffer.from(hexString.slice(2), 'hex').toString('utf8');
      }
    }
    map.set(validator.toString(), displayName);
  });
  return map;
};

export const fetchMappedValidatorsTotalValueStaked = async (
  rpcEndpoint: string,
): Promise<Map<string, BN>> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.staking) {
    throw new Error('staking pallet is not available in the runtime');
  }

  const activeEra = await api.query.staking.activeEra();
  const activeEraIndex = activeEra.unwrap().index;
  const validators = await fetchValidators(rpcEndpoint);
  const stakerPromises = validators.map(async (val) => {
    const erasStakers = await api.query.staking.erasStakersOverview(
      activeEraIndex,
      val,
    );
    const exposure = erasStakers.unwrap();
    const totalStaked = exposure.total.unwrap().toBn() || BN_ZERO;
    return {
      validator: val.toString(),
      totalStaked,
    };
  });
  const stakers = await Promise.all(stakerPromises);
  const map = new Map<string, BN>();
  stakers.forEach((staker) => {
    map.set(staker.validator, staker.totalStaked);
  });
  return map;
};

export const fetchMappedValidatorsCommission = async (
  rpcEndpoint: string,
): Promise<Map<string, BN>> => {
  const api = await getApiPromise(rpcEndpoint);
  const validators = await fetchValidators(rpcEndpoint);

  if (!api.query.staking) {
    throw new Error('staking pallet is not available in the runtime');
  }

  const commissionPromises = validators.map(async (val) => {
    const prefs = await api.query.staking.validators(val);
    return {
      validator: val.toString(),
      commission: prefs.commission.unwrap(),
    };
  });
  const commissions = await Promise.all(commissionPromises);
  const map = new Map<string, BN>();
  commissions.forEach((commission) => {
    map.set(commission.validator, commission.commission);
  });
  return map;
};

export const fetchChainDecimals = async (
  rpcEndpoint: string,
): Promise<number> => {
  const api = await getApiPromise(rpcEndpoint);
  const chainDecimals = await api.registry.chainDecimals;
  return chainDecimals.length > 0 ? chainDecimals[0] : 18;
};

export const fetchTokenSymbol = async (
  rpcEndpoint: string,
): Promise<string> => {
  const api = await getApiPromise(rpcEndpoint);
  const tokenSymbol = api.registry.chainTokens[0];
  return tokenSymbol;
};

type Dapp = {
  id: string;
  address: string;
};

export const fetchDapps = async (rpcEndpoint: string): Promise<Dapp[]> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.dappStaking) {
    throw new Error('dappStaking pallet is not available in the runtime');
  }

  const integratedDapps = await api.query.dappStaking.integratedDApps.entries();

  const dapps = integratedDapps.map((dapp) => {
    const dappAddress = JSON.parse(dapp[0].args[0].toString());
    const dappIdOption = dapp[1] as Option<PalletDappStakingV3DAppInfo>;
    let dappId = '';

    if (dappIdOption.isSome) {
      dappId = dappIdOption.unwrap().id.toString();
    }
    return {
      id: dappId,
      address: dappAddress.evm || dappAddress.wasm,
    };
  });

  return dapps;
};

export const fetchMappedDappsTotalValueStaked = async (
  rpcEndpoint: string,
): Promise<Map<string, BN>> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.dappStaking) {
    throw new Error('dappStaking pallet is not available in the runtime');
  }

  const contractStakes = await api.query.dappStaking.contractStake.entries();
  const map = new Map<string, BN>();
  contractStakes.forEach((contractStake) => {
    const dappId = contractStake[0].args[0].toString();
    const stakeAmount =
      contractStake[1] as PalletDappStakingV3ContractStakeAmount;
    let totalStaked = BN_ZERO;

    if (!stakeAmount.isEmpty) {
      if (!stakeAmount.stakedFuture.isNone) {
        totalStaked = stakeAmount.stakedFuture
          .unwrap()
          .voting.toBn()
          .add(stakeAmount.stakedFuture.unwrap().buildAndEarn.toBn());
      } else {
        totalStaked = stakeAmount.staked.voting
          .toBn()
          .add(stakeAmount.staked.buildAndEarn.toBn());
      }
    }

    map.set(dappId, totalStaked);
  });

  return map;
};

type VaultOrStakePool = {
  id: string;
  totalValueStaked: BN;
  commission: BN;
  accountId: string;
  type: string;
};

export const fetchVaultsAndStakePools = async (
  rpcEndpoint: string,
): Promise<VaultOrStakePool[]> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.phalaBasePool) {
    throw new Error('phalaBasePool pallet is not available in the runtime');
  }

  const poolsInPhalaBasePool = await api.query.phalaBasePool.pools.entries();

  return poolsInPhalaBasePool.map((pool) => {
    const id = pool[0].args[0].toString();
    const poolInfo = pool[1] as Option<any>;

    let type = '';
    let accountId = '';
    let totalValueStaked = BN_ZERO;
    let commission = BN_ZERO;

    if (poolInfo.isSome) {
      const poolInfoObj = JSON.parse(poolInfo.unwrap().toString());

      if (poolInfoObj.vault) {
        type = 'vault';
        commission = poolInfoObj[type].commission || BN_ZERO;
      } else {
        type = 'stakePool';
        commission = poolInfoObj[type].payoutCommission || BN_ZERO;
      }

      accountId = poolInfoObj[type].basepool.poolAccountId.toString();

      if (poolInfoObj[type].basepool.totalValue !== undefined) {
        totalValueStaked = new BN(
          cleanHexString(poolInfoObj[type].basepool.totalValue.toString()),
          16,
        );
      }
    }

    return {
      id,
      totalValueStaked,
      commission,
      accountId,
      type,
    };
  });
};

/** @internal */
const cleanHexString = (hex: string) => {
  if (!hex) return '';

  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }

  return hex;
};
