import { warpRouteConfigs } from '@hyperlane-xyz/registry';
import { WarpCoreConfig, WarpCoreConfigSchema } from '@hyperlane-xyz/sdk';
import { objFilter, objMerge } from '@hyperlane-xyz/utils';

import { customWarpRouteConfigs, warpRouteWhitelist } from './consts';

export default function assembleWarpCoreConfig(): WarpCoreConfig {
  const result = WarpCoreConfigSchema.safeParse(customWarpRouteConfigs);
  if (!result.success) {
    throw new Error(`Invalid warp core config: ${result.error.toString()}`);
  }

  const customConfig = result.data;

  const filteredWarpRouteConfigs = warpRouteWhitelist
    ? filterToIds(warpRouteConfigs, warpRouteWhitelist)
    : warpRouteConfigs;

  const configValues = Object.values(filteredWarpRouteConfigs);

  const configTokens = configValues.map((c) => c.tokens).flat();
  const tokens = dedupeTokens([...configTokens, ...customConfig.tokens]);

  if (!tokens.length)
    throw new Error(
      'No warp route configs provided. Please check your registry, warp route whitelist, and custom route configs for issues.',
    );

  const configOptions = configValues.map((c) => c.options).flat();
  const combinedOptions = [...configOptions, customConfig.options];

  const options = combinedOptions.reduce<WarpCoreConfig['options']>(
    (acc, o) => {
      if (!o || !acc) return acc;
      for (const key of Object.keys(o) as Array<keyof typeof o>) {
        const currentValue = acc[key as keyof typeof acc] || [];
        const newValue = o[key] || [];
        acc[key] = currentValue.concat(newValue) as any; // Using any temporarily to avoid type errors
      }
      return acc;
    },
    {},
  );

  return { tokens, options };
}

function filterToIds(
  config: Record<string, WarpCoreConfig>,
  idWhitelist: string[],
): Record<string, WarpCoreConfig> {
  return objFilter(config, (id, _): _ is WarpCoreConfig =>
    idWhitelist.includes(id),
  );
}

// Separate warp configs may contain duplicate definitions of the same token.
// E.g. an IBC token that gets used for interchain gas in many different routes.
function dedupeTokens(
  tokens: WarpCoreConfig['tokens'],
): WarpCoreConfig['tokens'] {
  const idToToken: Record<string, WarpCoreConfig['tokens'][number]> = {};
  for (const token of tokens) {
    const id = `${token.chainName}|${token.addressOrDenom?.toLowerCase()}`;
    idToToken[id] = objMerge(idToToken[id] || {}, token);
  }
  return Object.values(idToToken);
}
