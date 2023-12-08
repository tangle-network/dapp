import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { u128 } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';
import { TANGLE_RPC_ENDPOINT } from '@webb-tools/webb-ui-components/constants';
import { firstValueFrom } from 'rxjs';

const apiPromiseCache = new Map<string, ApiPromise>();

const TOKEN_UNIT = 'tTNT';

export const getPolkadotApiPromise = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
): Promise<ApiPromise | undefined> => {
  if (apiPromiseCache.has(endpoint)) {
    return apiPromiseCache.get(endpoint);
  }

  try {
    const wsProvider = new WsProvider(endpoint);
    const apiPromise = await ApiPromise.create({
      provider: wsProvider,
      noInitWarn: true,
    });

    apiPromiseCache.set(endpoint, apiPromise);

    return apiPromise;
  } catch (e) {
    console.error(e);
  }
};

const apiRxCache = new Map<string, ApiRx>();

export const getPolkadotApiRx = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
): Promise<ApiRx | undefined> => {
  if (apiRxCache.has(endpoint)) {
    return apiRxCache.get(endpoint);
  }

  try {
    const provider = new WsProvider(endpoint);
    const api = new ApiRx({
      provider,
      noInitWarn: true,
    });

    const apiRx = await firstValueFrom(api.isReady);
    apiRxCache.set(endpoint, apiRx);

    return apiRx;
  } catch (error) {
    console.error(error);
  }
};

export const formatTokenBalance = async (
  balance: u128
): Promise<string | undefined> => {
  try {
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
  } catch (error) {
    console.error(error);
  }
};

export const getTotalNumberOfNominators = async (
  validatorAddress: string
): Promise<number | undefined> => {
  try {
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
  } catch (error) {
    throw new Error(
      'Failed to get total number of validators for validator address - ' +
        validatorAddress
    );
  }
};

export const getValidatorIdentity = async (
  validatorAddress: string
): Promise<string | undefined> => {
  try {
    const api = await getPolkadotApiPromise();

    if (!api) return '';

    const identityOption = await api.query.identity.identityOf(
      validatorAddress
    );

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
  } catch (error) {
    throw new Error(
      'Failed to get identity for validator address - ' + validatorAddress
    );
  }
};

export const isNominatorAlreadyBonded = async (
  nominatorAddress: string
): Promise<boolean> => {
  try {
    const api = await getPolkadotApiPromise();

    if (!api) throw new Error('Failed to get Polkadot API');

    const isBondedInfo = await api.query.staking.bonded(nominatorAddress);

    return isBondedInfo.isSome;
  } catch (error) {
    throw new Error(
      'Failed to check if nominator is already bonded - ' + nominatorAddress
    );
  }
};

export const isNominatorFirstTimeNominator = async (
  nominatorAddress: string
): Promise<boolean> => {
  try {
    const api = await getPolkadotApiPromise();

    if (!api) throw new Error('Failed to get Polkadot API');

    const isAlreadyBonded = await isNominatorAlreadyBonded(nominatorAddress);
    const nominatedValidators = await api.query.staking.nominators(
      nominatorAddress
    );

    return !isAlreadyBonded && !nominatedValidators.isSome;
  } catch (error) {
    throw new Error(
      'Failed to check if nominator is a first time nominator - ' +
        nominatorAddress
    );
  }
};
