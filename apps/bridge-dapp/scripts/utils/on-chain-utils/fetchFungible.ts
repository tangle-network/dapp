import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import {
  PalletAssetRegistryAssetDetails,
  PalletAssetRegistryAssetMetadata,
} from '@polkadot/types/lookup';
import { retryPromise } from '@webb-tools/browser-utils';
import {
  FungibleTokenWrapper__factory,
  VAnchor__factory,
} from '@webb-tools/contracts';
import { ICurrency } from '@webb-tools/dapp-config/on-chain-config';
import '@webb-tools/protocol-substrate-types';
import { ethers } from 'ethers';
import getViemClient from './getViemClient';
import { ChainType, calculateTypedChainId } from '@webb-tools/sdk-core';

// Private methods

async function testViem(
  typedChainId: number,
  fungibleAddr: string,
  vAnchorAddr: string
) {
  const client = getViemClient(typedChainId);

  const address = (
    fungibleAddr.startsWith('0x') ? fungibleAddr : `0x${fungibleAddr}`
  ) as `0x${string}`;

  const sharedFungibleProps = {
    address,
    abi: FungibleTokenWrapper__factory.abi,
  } as const;

  const result = await client.multicall({
    contracts: [
      {
        ...sharedFungibleProps,
        functionName: 'name',
      },
      {
        ...sharedFungibleProps,
        functionName: 'symbol',
      },
      {
        ...sharedFungibleProps,
        functionName: 'decimals',
      },
      {
        ...sharedFungibleProps,
        functionName: 'getTokens',
      },
      {
        ...sharedFungibleProps,
        functionName: 'isNativeAllowed',
      },
    ],
  });

  console.log('Result: ', result);
}

async function fetchSubstrateFungibleCurrency(
  treeId: string,
  provider: ApiPromise
): Promise<ICurrency> {
  const vanchor = await provider.query.vAnchorBn254.vAnchors(treeId);
  if (vanchor.isNone) {
    throw new Error('VAnchor not found with tree id: ' + treeId);
  }

  const vanchorDetail = vanchor.unwrap();
  const assetId = vanchorDetail.asset.toString();

  const [asset, metadata] = await provider.queryMulti<
    [
      Option<PalletAssetRegistryAssetDetails>,
      Option<PalletAssetRegistryAssetMetadata>
    ]
  >([
    [provider.query.assetRegistry.assets, assetId],
    [provider.query.assetRegistry.assetMetadataMap, assetId],
  ]);

  if (asset.isNone || metadata.isNone) {
    throw new Error('Asset not found with id: ' + assetId);
  }

  const assetDetail = asset.unwrap();
  const assetMetadata = metadata.unwrap();
  if (!assetDetail.assetType.isPoolShare) {
    throw new Error('Asset type is not PoolShare');
  }

  const name = assetDetail.name.toHuman()?.toString();
  const symbol = assetMetadata.symbol.toHuman()?.toString();
  const decimals = assetMetadata.decimals.toNumber();
  if (!name || !symbol || !decimals) {
    throw new Error('Asset name is empty');
  }

  return {
    name,
    symbol,
    decimals,
    address: assetId,
  };
}

async function fetchEVMFungibleCurrency(
  anchorAddress: string,
  provider: ethers.providers.Web3Provider
): Promise<ICurrency> {
  const network = await provider.getNetwork();
  const typedChainId = calculateTypedChainId(ChainType.EVM, network.chainId);

  const vAcnhorContract = VAnchor__factory.connect(anchorAddress, provider);
  const fungibleCurrencyAddress = await retryPromise(vAcnhorContract.token);

  await testViem(typedChainId, fungibleCurrencyAddress, anchorAddress);

  const fungibleCurrencyContract = FungibleTokenWrapper__factory.connect(
    fungibleCurrencyAddress,
    provider
  );

  const [name, symbol, decimals] = await Promise.all([
    retryPromise(fungibleCurrencyContract.name),
    retryPromise(fungibleCurrencyContract.symbol),
    retryPromise(fungibleCurrencyContract.decimals),
  ]);

  return {
    address: fungibleCurrencyAddress,
    decimals,
    symbol,
    name,
  };
}

// Default method

async function fetchFungibleCurrency(
  anchorAddress: string,
  provider: ethers.providers.Web3Provider | ApiPromise
): Promise<ICurrency> {
  if (provider instanceof ApiPromise) {
    return fetchSubstrateFungibleCurrency(anchorAddress, provider);
  }

  if (provider instanceof ethers.providers.Web3Provider) {
    return fetchEVMFungibleCurrency(anchorAddress, provider);
  }

  throw new Error('Invalid provider');
}

export default fetchFungibleCurrency;
