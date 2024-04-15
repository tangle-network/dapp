import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { ethers } from 'ethers';
import { parseEther } from 'viem';

import { PrecompileAddress } from '../../constants/evmPrecompiles';
import {
  BATCH_PRECOMPILE_ABI,
  STAKING_PRECOMPILE_ABI,
} from '../../constants/evmPrecompiles';
import { PaymentDestination } from '../../types';
import { createEvmWalletClient, evmPublicClient } from './client';

const PAYEE_STAKED =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const PAYEE_STASH =
  '0x0000000000000000000000000000000000000000000000000000000000000001';

const PAYEE_CONTROLLER =
  '0x0000000000000000000000000000000000000000000000000000000000000002';

const stakingInterface = new ethers.utils.Interface(STAKING_PRECOMPILE_ABI);

export const batchNominateEvm = async (
  nominatorAddress: string,
  bondingAmount: number,
  paymentDestination: string,
  validatorAddresses: string[]
) => {
  // Prepare bond, setPayee, nominate calls
  const value = parseEther(bondingAmount.toString());
  const payee =
    paymentDestination === PaymentDestination.STAKED
      ? PAYEE_STAKED
      : paymentDestination === PaymentDestination.STASH
      ? PAYEE_STASH
      : PAYEE_CONTROLLER;

  const targets = validatorAddresses.map((address) =>
    u8aToHex(decodeAddress(address))
  );

  const bondCallData = stakingInterface.encodeFunctionData('bond', [
    value,
    payee,
  ]);
  const payeeCallData = stakingInterface.encodeFunctionData('setPayee', [
    payee,
  ]);
  const nominateCallData = stakingInterface.encodeFunctionData('nominate', [
    targets,
  ]);

  const batchCalls = [
    {
      to: PrecompileAddress.STAKING,
      value: 0,
      callData: bondCallData,
      gasLimit: 0,
    },
    {
      to: PrecompileAddress.STAKING,
      value: 0,
      callData: payeeCallData,
      gasLimit: 0,
    },
    {
      to: PrecompileAddress.STAKING,
      value: 0,
      callData: nominateCallData,
      gasLimit: 0,
    },
  ];

  console.debug('batchCallsEVM', batchCalls);
  console.debug('evmPublicClient', evmPublicClient);

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.BATCH,
    abi: BATCH_PRECOMPILE_ABI,
    functionName: 'batchAll',
    args: [
      batchCalls.map((call) => call.to),
      batchCalls.map((call) => call.value),
      batchCalls.map((call) => call.callData),
      batchCalls.map((call) => call.gasLimit),
    ],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);
  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};
