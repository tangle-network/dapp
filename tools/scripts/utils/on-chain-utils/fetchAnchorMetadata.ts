import assert from 'assert';
import { getContract } from 'viem';
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
import {
  DEFAULT_DECIMALS,
  DEFAULT_NATIVE_INDEX,
  ZERO_BIG_INT,
} from '@webb-tools/dapp-config/src/constants';
import { AnchorMetadata, ICurrency } from '@webb-tools/dapp-config/src/types';
import '@webb-tools/tangle-substrate-types';
import { ResourceId } from '@webb-tools/sdk-core/proposals/ResourceId.js';
import { hexToU8a, u8aToHex } from '@webb-tools/utils';
import getViemClient from '@webb-tools/web3-api-provider/utils/getViemClient';
import getViemValidAddressFormat from '@webb-tools/web3-api-provider/utils/getViemValidAddressFormat';
import { anchorDeploymentBlock } from '@webb-tools/dapp-config/anchors';
import { anchorSignatureBridge } from '@webb-tools/dapp-config/signature-bridges';

async function fetchEVMAnchorMetadata(
  anchorAddress: string,
  typedChainId: number
): Promise<AnchorMetadata> {
  if (anchorDeploymentBlock?.[typedChainId]?.[anchorAddress] === undefined) {
    throw new Error(
      `Getting Deployment Block: Invalid Chain (with TypedChainId ${typedChainId}) or VAnchor address (${anchorAddress})`
    );
  }

  if (anchorSignatureBridge?.[typedChainId]?.[anchorAddress] === undefined) {
    throw new Error(
      `Getting Signature Bridge: Invalid Chain (with TypedChainId ${typedChainId}) or VAnchor address (${anchorAddress})`
    );
  }

  const client = getViemClient(typedChainId);

  const anchorAddrHex = getViemValidAddressFormat(anchorAddress);

  const sharedAnchorProps = {
    address: anchorAddrHex,
    abi: VAnchor__factory.abi,
  } as const;

  // Use when multicall is not supported
  const vAnchorContract = getContract({
    ...sharedAnchorProps,
    publicClient: client,
  });

  const isMulticallSupported = !!client.chain.contracts?.multicall3;

  const [fungibleAddr, neighborEdges] = await (isMulticallSupported
    ? client.multicall({
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
      })
    : Promise.all([
        vAnchorContract.read.token(),
        vAnchorContract.read.getLatestNeighborEdges(),
      ]));

  const sharedFungibleProps = {
    address: fungibleAddr,
    abi: FungibleTokenWrapper__factory.abi,
  } as const;

  // Use when multicall is not supported
  const fungibleContract = getContract({
    ...sharedFungibleProps,
    publicClient: client,
  });

  const [
    fungibleName,
    fungibleSymbol,
    fungibleDecimals,
    wrappableTokens,
    isNativeAllowed,
  ] = await (isMulticallSupported
    ? client.multicall({
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
      })
    : Promise.all([
        fungibleContract.read.name(),
        fungibleContract.read.symbol(),
        fungibleContract.read.decimals(),
        fungibleContract.read.getTokens(),
        fungibleContract.read.isNativeAllowed(),
      ]));

  const fungibleCurrency = {
    name: fungibleName,
    symbol: fungibleSymbol,
    decimals: fungibleDecimals,
    address: fungibleAddr,
  } satisfies ICurrency;

  const wrappableWithoutNative: ReadonlyArray<`0x${string}`> =
    wrappableTokens.filter((addr) => BigInt(addr) !== BigInt(0));

  const res = await (isMulticallSupported
    ? client.multicall({
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
      })
    : Promise.all(
        wrappableWithoutNative.map((addr) => {
          const contract = getContract({
            address: addr,
            abi: ERC20__factory.abi,
            publicClient: client,
          });

          return Promise.all([
            contract.read.name(),
            contract.read.symbol(),
            contract.read.decimals(),
          ]);
        })
      ).then((res) =>
        res.reduce(
          (acc, val) => acc.concat(...val.map((v) => v.toString())),
          [] as string[]
        )
      ));

  assert.strictEqual(res.length % 3, 0, 'Result length is not a multiple of 3');
  assert.strictEqual(
    res.length / 3,
    wrappableWithoutNative.length,
    'Invalid wrappable token metadata'
  );

  const wrappableCurrencies: Array<ICurrency> = [];
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
    .filter((edge) => edge.chainID !== ZERO_BIG_INT)
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

  const { timestamp: creationTimestamp } = await client.getBlock({
    blockNumber: BigInt(anchorDeploymentBlock[typedChainId][anchorAddress]),
  });

  const treasuryAddress = await fungibleContract.read.feeRecipient();

  return {
    address: anchorAddress,
    fungibleCurrency,
    wrappableCurrencies,
    isNativeAllowed,
    linkableAnchor,
    signatureBridge: anchorSignatureBridge[typedChainId][anchorAddress],
    treasuryAddress,
    creationTimestamp: Number(creationTimestamp),
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
