import { u128 } from '@polkadot/types';

import { PaymentDestination } from '../../types';
import { getPolkadotApiPromise } from './api';

const PAYEE_STAKED = 'Staked';
const PAYEE_STASH = 'Stash';
const PAYEE_CONTROLLER = 'Controller';

export const bondTokens = async (
  nominatorAddress: string,
  amount_: number,
  paymentDestination: string
) => {
  const api = await getPolkadotApiPromise();

  if (!api) return undefined;
  const amount = new u128(api.registry, amount_.toString());

  const payee =
    paymentDestination === PaymentDestination.Staked
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.Stash
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  // Extrinsic staking.bond expects 2 arguments, got 3.
  const tx = api.tx.staking.bond(nominatorAddress, amount, payee);
  const hash = await tx.signAndSend(nominatorAddress);
  return hash.toString();
};

export const bondExtraTokens = async (
  nominatorAddress: string,
  amount_: number
) => {
  const api = await getPolkadotApiPromise();

  if (!api) return undefined;
  const amount = new u128(api.registry, amount_.toString());

  const tx = api.tx.staking.bondExtra(amount);
  const hash = await tx.signAndSend(nominatorAddress);
  return hash.toString();
};

export const updatePaymentDestination = async (
  nominatorAddress: string,
  paymentDestination: string
) => {
  const api = await getPolkadotApiPromise();

  if (!api) return undefined;

  const payee =
    paymentDestination === PaymentDestination.Staked
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.Stash
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const tx = api.tx.staking.setPayee(payee);
  const hash = await tx.signAndSend(nominatorAddress);
  return hash.toString();
};
