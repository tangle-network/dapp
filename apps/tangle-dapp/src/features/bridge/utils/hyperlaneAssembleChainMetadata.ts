import { GithubRegistry } from '@hyperlane-xyz/registry';
import { ChainMap, ChainMetadata } from '@hyperlane-xyz/sdk';
import {
  HYPERLANE_CHAINS,
  HYPERLANE_REGISTRY_URL,
} from '@tangle-network/tangle-shared-ui/constants/bridge';
import { z } from 'zod';

export default async function hyperlaneAssembleChainMetadata() {
  const result = z.record(z.custom<ChainMetadata>()).safeParse({
    ...HYPERLANE_CHAINS,
  });

  if (!result.success) {
    throw new Error(`Invalid chain config: ${result.error.toString()}`);
  }

  const customChainMetadata = result.data as ChainMap<ChainMetadata>;

  const registry = new GithubRegistry({ uri: HYPERLANE_REGISTRY_URL });

  const chains = customChainMetadata;

  return { chains, registry };
}
