import { hexToU8a, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  getContract,
  http,
  parseEther,
} from 'viem';

import { PaymentDestination } from '../types';
import { StakinInterfaceABI } from './abi';

const tangleTestnetConfig = chainsConfig[PresetTypedChainId.TangleTestnet];
delete tangleTestnetConfig.contracts;

const tangleTestnet = defineChain(tangleTestnetConfig);

const contractAddress = '0x0000000000000000000000000000000000000800';

const payeeStaked =
  '0x0000000000000000000000000000000000000000000000000000000000000001';

const payeeStash =
  '0x0000000000000000000000000000000000000000000000000000000000000002';

export const evmPublicClient = createPublicClient({
  chain: tangleTestnet,
  transport: http(),
});

// FUNCTIONS
export const bondAndNominate = async (
  walletAddress: string,
  selectedValidators: string[],
  amount: number,
  paymentDestination: string
) => {
  const client = createWalletClient({
    chain: tangleTestnet,
    account: ensureHex(walletAddress),
    transport: custom(window.ethereum),
  });

  const amountToBond = parseEther(amount.toString());

  const payee = payeeStaked;

  const targets = selectedValidators.map((addr) => {
    return u8aToHex(decodeAddress(addr));
  });

  try {
    const bondTx = await client.writeContract({
      address: contractAddress,
      abi: StakinInterfaceABI,
      functionName: 'bond',
      args: [amountToBond, payee],
    });

    if (bondTx) {
      console.log('bondTx', bondTx);

      const nominateTx = await client.writeContract({
        address: contractAddress,
        abi: StakinInterfaceABI,
        functionName: 'nominate',
        args: [targets],
      });

      console.log('nominateTx', nominateTx);

      return nominateTx;
    }
  } catch (e) {
    console.log(e);
  }
};
