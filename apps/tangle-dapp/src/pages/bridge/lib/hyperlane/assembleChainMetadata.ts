import { GithubRegistry } from '@hyperlane-xyz/registry';
import {
  ChainMap,
  ChainMetadata,
  ChainMetadataSchema,
} from '@hyperlane-xyz/sdk';
import { z } from 'zod';

import { HYPERLANE_CHAINS, HYPERLANE_REGISTRY_URL } from '../../constants';

export default async function assembleChainMetadata() {
  const result = z.record(ChainMetadataSchema).safeParse({
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
