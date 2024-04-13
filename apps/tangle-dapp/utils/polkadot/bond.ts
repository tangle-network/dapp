import type { HexString } from '@polkadot/util/types';
import { parseEther } from 'viem';

import { StakingPayee } from '../../types';
import { getApiPromise } from './api';
import { getTxPromise } from './utils';

const PAYEE_STAKED = 'Staked';
const PAYEE_STASH = 'Stash';
const PAYEE_CONTROLLER = 'Controller';

export const bondTokens = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  amount: number,
  paymentDestination: string
): Promise<HexString> => {
  const api = await getApiPromise(rpcEndpoint);

  const payee =
    paymentDestination === StakingPayee.STAKED
      ? PAYEE_STAKED
      : paymentDestination === StakingPayee.STASH
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const value = parseEther(amount.toString());
  const tx = api.tx.staking.bond(value, payee);

  return getTxPromise(nominatorAddress, tx);
};

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

export const updatePaymentDestination = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  paymentDestination: string
): Promise<HexString> => {
  const api = await getApiPromise(rpcEndpoint);

  const payee =
    paymentDestination === StakingPayee.STAKED
      ? PAYEE_STAKED
      : paymentDestination === StakingPayee.STASH
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const tx = api.tx.staking.setPayee(payee);

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
