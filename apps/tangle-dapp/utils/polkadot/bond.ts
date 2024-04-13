import type { HexString } from '@polkadot/util/types';
import { parseEther } from 'viem';

import { getApiPromise } from './api';
import { getTxPromise } from './utils';

export const bondExtraTokens = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  amount: number
): Promise<HexString> => {
  const api = await getApiPromise(rpcEndpoint);
  const value = parseEther(amount.toString());
  const tx = api.tx.staking.bondExtra(value);

  return getTxPromise(nominatorAddress, tx);
};

export const unbondTokens = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  amount: number
) => {
  const api = await getApiPromise(rpcEndpoint);
  const value = parseEther(amount.toString());
  const tx = api.tx.staking.unbond(value);

  return getTxPromise(nominatorAddress, tx);
};

export const rebondTokens = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  amount: number
) => {
  const api = await getApiPromise(rpcEndpoint);
  const value = parseEther(amount.toString());
  const tx = api.tx.staking.rebond(value);

  return getTxPromise(nominatorAddress, tx);
};

export const withdrawUnbondedTokens = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  slashingSpans: number
) => {
  const api = await getApiPromise(rpcEndpoint);
  const tx = api.tx.staking.withdrawUnbonded(slashingSpans);

  return getTxPromise(nominatorAddress, tx);
};

export const getSlashingSpans = async (
  rpcEndpoint: string,
  address: string
): Promise<string | undefined> => {
  const api = await getApiPromise(rpcEndpoint);
  const slashingSpans = await api.query.staking.slashingSpans(address);

  return slashingSpans.toString();
};
