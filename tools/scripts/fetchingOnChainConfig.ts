import { ApiPromise } from '@polkadot/api';
import { ICurrency } from '@webb-tools/dapp-config/on-chain-config/on-chain-config-base';
import {
  anchorDeploymentBlock,
  parsedAnchorConfig,
} from '@webb-tools/dapp-config/src/anchors/anchor-config';
import { chainsConfig } from '@webb-tools/dapp-config/src/chains/chain-config';
import { AnchorMetadata, ConfigType } from '@webb-tools/dapp-config/src/types';
import substrateProviderFactory from '@webb-tools/polkadot-api-provider/src/utils/substrateProviderFactory';
import {
  ChainType,
  parseTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import evmProviderFactory from '@webb-tools/web3-api-provider/src/utils/evmProviderFactory';
import fs from 'fs';
import { Listr, color } from 'listr2';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import path from 'path';
import { ON_CHAIN_CONFIG_PATH } from './constants';
import fetchAnchorMetadata from './utils/on-chain-utils/fetchAnchorMetadata';
import fetchNativeCurrency from './utils/on-chain-utils/fetchNative';
import mergeConfig from './utils/on-chain-utils/mergeConfig';

const configPath = path.join(workspaceRoot, ON_CHAIN_CONFIG_PATH);

interface Ctx {
  typedChainIds: number[];
  nativeRecord: Record<number, ICurrency>;
  anchorMetadataRecord: Record<number, AnchorMetadata[]>;
  substrateProviderRecord?: Record<number, ApiPromise>;
}

const ctx: Ctx = {
  typedChainIds: Object.keys(anchorDeploymentBlock).map((id) => +id),
  nativeRecord: {},
  anchorMetadataRecord: {},
};

// Private methods

async function filterActiveEVMChains(
  typedChainIds: number[]
): Promise<number[]> {
  return (
    await Promise.all(
      typedChainIds
        .filter(
          (typedChainId) =>
            parseTypedChainId(typedChainId).chainType === ChainType.EVM
        )
        .map(async (typedChainId) => {
          try {
            const provider = await evmProviderFactory(typedChainId);
            await provider.getNetwork();
            return typedChainId;
          } catch (error) {
            return null;
          }
        })
    )
  ).filter((t): t is number => t !== null);
}

async function filterActiveSubstrateChains(
  typedChainIds: number[]
): Promise<Record<number, ApiPromise>> {
  const providers = await Promise.all(
    typedChainIds.map(async (typedChainId) => {
      const { chainType } = parseTypedChainId(typedChainId);
      if (chainType !== ChainType.Substrate) {
        return null;
      }

      try {
        return await substrateProviderFactory(+typedChainId);
      } catch (error) {
        return null;
      }
    })
  );

  return providers.reduce((acc, provider, index) => {
    if (provider) {
      acc[typedChainIds[index]] = provider;
    }
    return acc;
  }, {} as Record<number, ApiPromise>);
}

async function fetchNativeTask(
  typedChainIds: number[],
  substrateProviderRecord?: Record<number, ApiPromise>
) {
  const nativeCurrencies = await typedChainIds.reduce(
    async (acc, typedChainId) => {
      const native = await acc;
      const provider = substrateProviderRecord?.[typedChainId];
      const nativeCurrency = await fetchNativeCurrency(typedChainId, provider);
      native[typedChainId] = nativeCurrency;
      return native;
    },
    {} as Promise<Record<number, ICurrency>>
  );

  return nativeCurrencies;
}

async function fetchAnchorMetadataTask(
  typedChainIds: number[],
  substrateProviderRecord?: Record<number, ApiPromise>
): Promise<Record<number, AnchorMetadata[]>> {
  // Fetch anchor metadata in parallel
  const metadataWithTypedChainId = await Promise.all(
    typedChainIds.map(async (typedChainId) => {
      const addresses = parsedAnchorConfig[typedChainId];
      const provider = substrateProviderRecord?.[typedChainId];

      // Fetch metadata in parallel and ignore the rejected ones
      const metadataSettled = await Promise.allSettled(
        addresses.map((address) =>
          fetchAnchorMetadata(address, typedChainId, provider)
        )
      );

      const metadata = metadataSettled
        .filter(
          (result): result is PromiseFulfilledResult<AnchorMetadata> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value);

      return {
        typedChainId,
        metadata,
      };
    })
  );

  const metadataRecord = metadataWithTypedChainId.reduce(
    (acc, { typedChainId, metadata }) => {
      acc[typedChainId] = metadata;
      return acc;
    },
    {} as Record<number, AnchorMetadata[]>
  );

  return metadataRecord;
}

async function writeFileTask(
  typedChainIds: number[],
  nativeRecord: Record<number, ICurrency>,
  metadataRecord: Record<number, AnchorMetadata[]>
): Promise<void> {
  const fetchedCfg = typedChainIds.reduce((acc, typedChainId) => {
    const native = nativeRecord[typedChainId];
    const anchorMetadatas = metadataRecord[typedChainId];

    if (!native || !anchorMetadatas) {
      return acc;
    }

    acc[typedChainId] = {
      nativeCurrency: native,
      anchorMetadatas,
    };

    return acc;
  }, {} as ConfigType);

  const writableConfig = mergeConfig(configPath, fetchedCfg);

  // Ensure directories are created
  const dir = path.dirname(configPath);
  try {
    await fs.promises.access(dir);
  } catch (error) {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  // Write data to the JSON file
  await fs.promises.writeFile(
    configPath,
    JSON.stringify(writableConfig, null, 2)
  );
}

const tasks = new Listr<Ctx>(
  [
    {
      title: color.cyan('Filtering active chains...'),
      options: { persistentOutput: true },
      task: async (ctx, task) => {
        // Filter out the active chains
        const evmTypedChainIds = await filterActiveEVMChains(ctx.typedChainIds);

        const substrateProviderRecord = await filterActiveSubstrateChains(
          ctx.typedChainIds
        );

        const substrateTypedChainIds = Object.keys(substrateProviderRecord).map(
          (id) => +id
        );

        const activeTypedChainIds = evmTypedChainIds.concat(
          substrateTypedChainIds
        );

        const activeChainNames = activeTypedChainIds.map(
          (typedChainId) => chainsConfig[typedChainId].name
        );

        task.output = color.green(
          `Found ${
            activeTypedChainIds.length
          } active chains: ${activeChainNames.join(', ')}`
        );

        ctx.typedChainIds = activeTypedChainIds;
        ctx.substrateProviderRecord = substrateProviderRecord;
      },
    },
    {
      title: color.cyan('Fetching on chain config...'),
      options: { persistentOutput: true },
      task: async (ctx, task) =>
        task.newListr<Ctx>(
          [
            {
              title: color.cyan(`Fetching native currencies...`),
              options: { persistentOutput: true },
              task: async (ctx, task) => {
                ctx.nativeRecord = await fetchNativeTask(
                  ctx.typedChainIds,
                  ctx.substrateProviderRecord
                );

                const symbolsSet = Object.values(ctx.nativeRecord).reduce(
                  (acc, cur) => {
                    acc.add(cur.symbol);
                    return acc;
                  },
                  new Set<string>()
                );

                task.output = color.green(
                  `Found ${
                    Object.keys(ctx.nativeRecord).length
                  } native currencies with ${
                    symbolsSet.size
                  } symbols: ${Array.from(symbolsSet).join(', ')}`
                );
              },
            },
            {
              title: color.cyan(`Fetching anchor metadata...`),
              options: { persistentOutput: true },
              task: async (ctx, task) => {
                ctx.anchorMetadataRecord = await fetchAnchorMetadataTask(
                  ctx.typedChainIds,
                  ctx.substrateProviderRecord
                );

                // For logging
                const anchorsCount = Object.values(
                  ctx.anchorMetadataRecord
                ).reduce((acc, cur) => acc + cur.length, 0);

                task.output = color.green(
                  `Found ${anchorsCount} anchors on ${ctx.typedChainIds.length} chains`
                );
              },
            },
          ],
          {
            ctx,
            exitOnError: true,
            concurrent: true,
            rendererOptions: { collapseSubtasks: false },
          }
        ),
    },
    {
      title: color.cyan(`Writing config to ${configPath}...`),
      options: { persistentOutput: true },
      task: async (ctx, task) => {
        try {
          await writeFileTask(
            ctx.typedChainIds,
            ctx.nativeRecord,
            ctx.anchorMetadataRecord
          );

          task.output = color.green(
            `Config successfully written to ${color.bold(
              color.underline(configPath)
            )}`
          );
        } catch (error) {
          task.output = color.red(
            `Failed to write config to ${configPath}: ${error}`
          );
        }
      },
    },
  ],
  {
    ctx,
    exitOnError: true,
    concurrent: false,
  }
);

tasks
  .run()
  .then(() => {
    console.log(color.green(color.bold('✅ Done!')));
    process.exit(0);
  })
  .catch((error) => {
    console.log(
      color.red(color.bold(`❌ Error while running tasks: ${error}`))
    );
    process.exit(1);
  });
