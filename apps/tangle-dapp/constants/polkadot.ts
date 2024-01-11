import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { u128 } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';
import { TANGLE_RPC_ENDPOINT as TESTNET_RPC_ENDPOINT } from '@webb-tools/webb-ui-components/constants';
import { firstValueFrom } from 'rxjs';

const TOKEN_UNIT = 'tTNT';

const TANGLE_RPC_ENDPOINT = process.env['USING_LOCAL_TANGLE']
  ? 'ws://127.0.0.1:9944'
  : TESTNET_RPC_ENDPOINT;

const apiPromiseCache = new Map<string, ApiPromise>();

export const getPolkadotApiPromise: (
  endpoint?: string
) => Promise<ApiPromise | undefined> = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
) => {
  if (apiPromiseCache.has(endpoint)) {
    return apiPromiseCache.get(endpoint);
  }

  const wsProvider = new WsProvider(endpoint);
  const apiPromise = await ApiPromise.create({
    provider: wsProvider,
    noInitWarn: true,
  });

  apiPromiseCache.set(endpoint, apiPromise);

  return apiPromise;
};

const apiRxCache = new Map<string, ApiRx>();

export const getPolkadotApiRx = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
): Promise<ApiRx | undefined> => {
  if (apiRxCache.has(endpoint)) {
    return apiRxCache.get(endpoint);
  }

  const provider = new WsProvider(endpoint);
  const api = new ApiRx({
    provider,
    noInitWarn: true,
  });

  const apiRx = await firstValueFrom(api.isReady);
  apiRxCache.set(endpoint, apiRx);

  return apiRx;
};

export const formatTokenBalance = async (
  balance: u128
): Promise<string | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return balance.toString();

  if (balance.toString() === '0') return `0 ${TOKEN_UNIT}`;

  const chainDecimals = await api.registry.chainDecimals;
  const balanceFormatType = {
    decimals: chainDecimals[0],
    withUnit: TOKEN_UNIT,
  };

  const formattedBalance = formatBalance(balance, balanceFormatType);

  return formattedBalance;
};

export const getTotalNumberOfNominators = async (
  validatorAddress: string
): Promise<number | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return NaN;

  const nominators = await api.query.staking.nominators.entries();
  const totalNominators = nominators.filter(([, nominatorData]) => {
    const nominations = nominatorData.unwrapOrDefault();
    return (
      nominations.targets &&
      nominations.targets.some(
        (target) => target.toString() === validatorAddress
      )
    );
  });
  const delegations = totalNominators.length.toString();

  return Number(delegations);
};

export const getValidatorIdentity = async (
  validatorAddress: string
): Promise<string | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return '';

  const identityOption = await api.query.identity.identityOf(validatorAddress);

  let name = '';

  if (identityOption.isSome) {
    const { info } = identityOption.unwrap();
    const displayNameInfo = info.display.toString();
    const displayNameObject = JSON.parse(displayNameInfo);

    if (displayNameObject.raw) {
      const hexString = displayNameObject.raw;
      name = Buffer.from(hexString.slice(2), 'hex').toString('utf8');
    }
  } else {
    name = validatorAddress;
  }

  return name;
};

export const isNominatorAlreadyBonded = async (
  nominatorAddress: string
): Promise<boolean> => {
  const api = await getPolkadotApiPromise();

  if (!api) throw new Error('Failed to get Polkadot API');

  const isBondedInfo = await api.query.staking.bonded(nominatorAddress);

  return isBondedInfo.isSome;
};

export const isNominatorFirstTimeNominator = async (
  nominatorAddress: string
): Promise<boolean> => {
  const api = await getPolkadotApiPromise();

  if (!api) throw new Error('Failed to get Polkadot API');

  const isAlreadyBonded = await isNominatorAlreadyBonded(nominatorAddress);
  const nominatedValidators = await api.query.staking.nominators(
    nominatorAddress
  );

  return !isAlreadyBonded && !nominatedValidators.isSome;
};

export const getValidatorCommission = async (
  validatorAddress: string
): Promise<string | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return '';

  const validatorPrefs = await api.query.staking.validators(validatorAddress);
  const commissionRate = validatorPrefs.commission.unwrap().toNumber();
  const commission = commissionRate / 10000000;

  return commission.toString();
};

export const getMaxNominationQuota = async (): Promise<number | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return NaN;

  const maxNominations = await api.consts.staking.maxNominations?.toNumber();

  return maxNominations;
};

export const getSlashingSpans = async (
  address: string
): Promise<string | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return '';

  const slashingSpans = await api.query.staking.slashingSpans(address);

  return slashingSpans.toString();
};
