import { Environment, Substrate } from '@buildwithsygma/sygma-sdk-core';
import { ApiPromise } from '@polkadot/api';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';

import { BridgeTokenType } from '../../../../types/bridge';

const { SubstrateAssetTransfer } = Substrate;

export default async function sygmaSubstrate(params?: {
  senderAddress: string;
  recipientAddress: string;
  api: ApiPromise;
  sourceChain: ChainConfig;
  destinationChain: ChainConfig;
  token: BridgeTokenType;
  amount: string;
}) {
  if (!params) return null;

  const {
    senderAddress,
    recipientAddress,
    api,
    sourceChain,
    destinationChain,
    token,
    amount,
  } = params;

  const assetTransfer = new SubstrateAssetTransfer();

  await assetTransfer.init(
    api,
    sourceChain.tag === 'live'
      ? Environment.MAINNET
      : sourceChain.tag === 'test'
        ? Environment.TESTNET
        : Environment.DEVNET, // (i.e. DEVNET, TESTNET, MAINNET)
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
  const tx = assetTransfer.buildTransferTransaction(transfer, fee);

  return { fee, tx };
}
