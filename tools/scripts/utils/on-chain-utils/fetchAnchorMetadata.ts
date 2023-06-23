import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import {
  PalletAssetRegistryAssetDetails,
  PalletAssetRegistryAssetMetadata,
  PalletLinkableTreeEdgeMetadata,
} from '@polkadot/types/lookup';
import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
  VAnchor__factory,
} from '@webb-tools/contracts';
import { ICurrency } from '@webb-tools/dapp-config/on-chain-config/on-chain-config-base';
import { AnchorMetadata } from '@webb-tools/dapp-config/src/types';
import '@webb-tools/protocol-substrate-types';
import { ResourceId } from '@webb-tools/sdk-core/proposals/ResourceId.js';
import { hexToU8a, u8aToHex } from '@webb-tools/utils';
import assert from 'assert';
import getViemClient from './getViemClient';
import { DEFAULT_DECIMALS, DEFAULT_NATIVE_INDEX } from './shared';

async function fetchEVMAnchorMetadata(
  anchorAddress: string,
  typedChainId: number
): Promise<AnchorMetadata> {
  const client = getViemClient(typedChainId);

  const anchorAddrHex = (
    anchorAddress.startsWith('0x') ? anchorAddress : `0x${anchorAddress}`
  ) as `0x${string}`;

  const sharedAnchorProps = {
    address: anchorAddrHex,
    abi: VAnchor__factory.abi,
  } as const;

  const [fungibleAddr, neighborEdges] = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        ...sharedAnchorProps,
        functionName: 'token',
      },
      {
        ...sharedAnchorProps,
        functionName: 'getLatestNeighborEdges',
      },
    ],
  });

  const sharedFungibleProps = {
    address: fungibleAddr,
    abi: FungibleTokenWrapper__factory.abi,
  } as const;

  const [
    fungibleName,
    fungibleSymbol,
    fungibleDecimals,
    wrappableTokens,
    isNativeAllowed,
  ] = await client.multicall({
    allowFailure: false,
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

  const fungibleCurrency = {
    name: fungibleName,
    symbol: fungibleSymbol,
    decimals: fungibleDecimals,
    address: fungibleAddr,
  } satisfies ICurrency;

  const wrappableWithoutNative = wrappableTokens.filter(
    (addr) => BigInt(addr) !== BigInt(0)
  );
  const res = await client.multicall({
    allowFailure: false,
    contracts: wrappableWithoutNative
      .map((addr) => {
        return [
          {
            address: addr,
            abi: ERC20__factory.abi,
            functionName: 'name',
          } as const,
          {
            address: addr,
            abi: ERC20__factory.abi,
            functionName: 'symbol',
          } as const,
          {
            address: addr,
            abi: ERC20__factory.abi,
            functionName: 'decimals',
          } as const,
        ];
      })
      .reduce((acc, val) => acc.concat(...val), []),
  });

  assert.strictEqual(res.length % 3, 0, 'Result length is not a multiple of 3');
  assert.strictEqual(
    res.length / 3,
    wrappableWithoutNative.length,
    'Invalid wrappable token metadata'
  );

  const wrappableCurrencies = [];
  for (let i = 0; i < res.length; i += 3) {
    const name = res[i].toString();
    const symbol = res[i + 1].toString();
    const decimals = +res[i + 2];
    const address = wrappableWithoutNative[i / 3];

    const wrappable = {
      name,
      symbol,
      decimals,
      address,
    } satisfies ICurrency;

    wrappableCurrencies.push(wrappable);
  }

  const linkableAnchor = neighborEdges
    .filter((edge) => edge.chainID !== BigInt(0))
    .reduce((acc, edge) => {
      const chainId = edge.chainID.toString();
      const resourceIdHex = edge.srcResourceID;

      const { targetSystem } = ResourceId.fromBytes(hexToU8a(resourceIdHex));

      const anchorAddr = BigInt(u8aToHex(targetSystem)).toString(16); // Convert to big int to remove leading zeros and convert back to hex

      return {
        ...acc,
        [chainId]: anchorAddr.startsWith('0x') ? anchorAddr : `0x${anchorAddr}`,
      };
    }, {} as Record<string, string>);

  return {
    address: anchorAddress,
    fungibleCurrency,
    wrappableCurrencies,
    isNativeAllowed,
    linkableAnchor,
  };
}

async function fetchSubstrateAnchorMetadata(
  treeId: string,
  typedChainId: number,
  provider: ApiPromise
): Promise<AnchorMetadata> {
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

  const fungible = {
    name,
    symbol,
    decimals,
    address: assetId,
  } satisfies ICurrency;

  const maxEdgesRes = await provider.query.linkableTreeBn254.maxEdges(treeId);
  const maxEdges = maxEdgesRes.toNumber();

  const edgeList = (
    await Promise.all(
      Array.from({ length: maxEdges }).map((_, idx) =>
        provider.query.linkableTreeBn254.edgeList<PalletLinkableTreeEdgeMetadata>(
          treeId,
          idx
        )
      )
    )
  ).filter((edge) => !edge.srcChainId.eq(0));

  const linkableAnchor = edgeList.reduce((acc, edge) => {
    const chainId = edge.srcChainId.toString();
    const resourceId = edge.srcResourceId.toHex();

    const { targetSystem } = ResourceId.fromBytes(hexToU8a(resourceId));
    const anchorAddr = BigInt(u8aToHex(targetSystem)).toString(16); // Convert to big int to remove leading zeros and convert back to hex

    return {
      ...acc,
      [chainId]: anchorAddr.startsWith('0x') ? anchorAddr : `0x${anchorAddr}`,
    };
  }, {} as Record<string, string>);

  const wrappableAssetIds = assetDetail.assetType.asPoolShare.map((a) =>
    a.toString()
  );

  const wrappableCurrencies = await Promise.all<ICurrency>(
    wrappableAssetIds
      .filter((id) => id !== DEFAULT_NATIVE_INDEX.toString())
      .map(async (assetId) => {
        const asset = await provider.query.assetRegistry.assets(assetId);
        if (asset.isNone) {
          throw new Error('Asset not found with id: ' + assetId);
        }

        const detail = asset.unwrap();
        const name = detail.name.toHuman()?.toString();
        if (!name) {
          throw new Error('Asset name is empty');
        }

        return {
          name,
          symbol: name,
          decimals: DEFAULT_DECIMALS,
          address: assetId,
        } satisfies ICurrency;
      })
  );

  const isNativeAllowed = wrappableAssetIds.includes(
    DEFAULT_NATIVE_INDEX.toString()
  );

  return {
    address: treeId,
    fungibleCurrency: fungible,
    wrappableCurrencies,
    isNativeAllowed,
    linkableAnchor,
  } satisfies AnchorMetadata;
}

async function fetchAnchorMetadata(
  anchorAddress: string,
  typedChainId: number,
  provider?: ApiPromise
): Promise<AnchorMetadata> {
  let metadata: AnchorMetadata;

  if (provider instanceof ApiPromise) {
    metadata = await fetchSubstrateAnchorMetadata(
      anchorAddress,
      typedChainId,
      provider
    );
  } else {
    metadata = await fetchEVMAnchorMetadata(anchorAddress, typedChainId);
  }

  return metadata;
}

export default fetchAnchorMetadata;
