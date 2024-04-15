import { parseEther } from 'viem';

import { PaymentDestination } from '../../types';
import { getPolkadotApiPromise } from './api';
import { getTxPromise } from './utils';

const PAYEE_STAKED = 'Staked';
const PAYEE_STASH = 'Stash';
const PAYEE_CONTROLLER = 'Controller';

export const batchNominateSubstrate = async (
  rpcEndpoint: string,
  nominatorAddress: string,
  bondingAmount: number,
  paymentDestination: string,
  validatorAddresses: string[]
) => {
  const api = await getPolkadotApiPromise(rpcEndpoint);
  const value = parseEther(bondingAmount.toString());
  const payee =
    paymentDestination === PaymentDestination.STAKED
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.STASH
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const bondTx = api.tx.staking.bond(value, payee);
  const payeeTx = api.tx.staking.setPayee(payee);
  const nominateTx = api.tx.staking.nominate(validatorAddresses);

  const batchTx = api.tx.utility.batch([bondTx, payeeTx, nominateTx]);

  return getTxPromise(nominatorAddress, batchTx);
};
