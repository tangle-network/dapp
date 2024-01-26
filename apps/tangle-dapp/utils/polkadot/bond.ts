import { u128 } from '@polkadot/types';
import type { HexString } from '@polkadot/util/types';
import { parseEther } from 'viem';

import { PaymentDestination } from '../../types';
import { getInjector, getPolkadotApiPromise } from './api';

const PAYEE_STAKED = 'Staked';
const PAYEE_STASH = 'Stash';
const PAYEE_CONTROLLER = 'Controller';

export const bondTokens = async (
  nominatorAddress: string,
  amount: number,
  paymentDestination: string
): Promise<HexString> => {
  const api = await getPolkadotApiPromise();
  const injector = await getInjector(nominatorAddress);

  if (!api || !injector) {
    throw new Error('Failed to get Polkadot API or injector');
  }

  const payee =
    paymentDestination === PaymentDestination.Staked
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.Stash
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const nonce = await api.rpc.system.accountNextIndex(nominatorAddress);
  const value = parseEther(amount.toString());
  return new Promise((resolve) => {
    api.tx.staking.bond(value, payee).signAndSend(
      nominatorAddress,
      {
        signer: injector.signer,
        nonce,
      },
      ({ status, dispatchError }) => {
        if (status.isInBlock || status.isFinalized) {
          if (dispatchError) {
            throw new Error('Failed to bond tokens');
          } else {
            resolve(status.hash.toHex());
          }
        }
      }
    );
  });
};

// TODO: update this func
export const bondExtraTokens = async (
  nominatorAddress: string,
  amount_: number
) => {
  const api = await getPolkadotApiPromise();
  const injector = await getInjector(nominatorAddress);

  if (!api || !injector) return undefined;
  const amount = new u128(api.registry, amount_.toString());

  const nonce = await api.rpc.system.accountNextIndex(nominatorAddress);
  const tx = api.tx.staking.bondExtra(amount);
  const hash = await tx.signAndSend(nominatorAddress, {
    signer: injector.signer,
    nonce,
  });
  return hash.toString();
};

// TODO: update this func
export const unbondTokens = async (
  nominatorAddress: string,
  amount_: number
) => {
  const api = await getPolkadotApiPromise();
  const injector = await getInjector(nominatorAddress);

  if (!api || !injector) return undefined;
  const amount = new u128(api.registry, amount_.toString());

  const tx = api.tx.staking.unbond(amount);
  const hash = await tx.signAndSend(nominatorAddress, {
    signer: injector.signer,
    nonce: -1,
  });
  return hash.toString();
};

// TODO: update this func
export const rebondTokens = async (
  nominatorAddress: string,
  amount_: number
) => {
  const api = await getPolkadotApiPromise();
  const injector = await getInjector(nominatorAddress);

  if (!api || !injector) return undefined;
  const amount = new u128(api.registry, amount_.toString());

  const tx = api.tx.staking.rebond(amount);
  const hash = await tx.signAndSend(nominatorAddress, {
    signer: injector.signer,
  });
  return hash.toString();
};

// TODO: update this func
export const withdrawUnbondedTokens = async (
  nominatorAddress: string,
  slashingSpans: number
) => {
  const api = await getPolkadotApiPromise();
  const injector = await getInjector(nominatorAddress);

  if (!api || !injector) return undefined;

  const tx = api.tx.staking.withdrawUnbonded(slashingSpans);
  const hash = await tx.signAndSend(nominatorAddress, {
    signer: injector.signer,
    nonce: -1,
  });
  return hash.toString();
};

export const updatePaymentDestination = async (
  nominatorAddress: string,
  paymentDestination: string
): Promise<HexString> => {
  const api = await getPolkadotApiPromise();
  const injector = await getInjector(nominatorAddress);

  if (!api || !injector) {
    throw new Error('Failed to get Polkadot API or injector');
  }

  const payee =
    paymentDestination === PaymentDestination.Staked
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.Stash
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const nonce = await api.rpc.system.accountNextIndex(nominatorAddress);
  return new Promise((resolve) => {
    api.tx.staking.setPayee(payee).signAndSend(
      nominatorAddress,
      {
        signer: injector.signer,
        nonce,
      },
      ({ status, dispatchError }) => {
        if (status.isInBlock || status.isFinalized) {
          if (dispatchError) {
            throw new Error('Failed to update payment destination');
          } else {
            resolve(status.hash.toHex());
          }
        }
      }
    );
  });
};
