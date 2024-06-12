import { Environment, EVMAssetTransfer } from '@buildwithsygma/sygma-sdk-core';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { ethers } from 'ethers';

import { BridgeTokenType } from '../../../../types/bridge';

export default async function sygmaEvm(params?: {
  senderAddress: string;
  recipientAddress: string;
  provider: ethers.providers.BaseProvider;
  sourceChain: ChainConfig;
  destinationChain: ChainConfig;
  token: BridgeTokenType;
  amount: string;
}) {
  if (!params) return null;

  const {
    senderAddress,
    recipientAddress,
    provider,
    sourceChain,
    destinationChain,
    token,
    amount,
  } = params;

  const assetTransfer = new EVMAssetTransfer();
  await assetTransfer.init(
    provider,
    sourceChain.tag === 'live'
      ? Environment.MAINNET
      : sourceChain.tag === 'test'
        ? Environment.TESTNET
        : Environment.DEVNET,
  );

  if (!token.sygmaResourceId) {
    throw new Error('Token does not have a Sygma resource ID');
  }

  const transfer = await assetTransfer.createFungibleTransfer(
    senderAddress,
    // NOTE: make sure the chain id is the same with Sygma SDK
    destinationChain.id,
    recipientAddress,
    token.sygmaResourceId,
    amount,
  );

  const fee = await assetTransfer.getFee(transfer);
  const tx = await assetTransfer.buildTransferTransaction(transfer, fee);

  return { fee, tx };
}
