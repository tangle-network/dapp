import { GithubRegistry } from '@hyperlane-xyz/registry';
import {
  ChainMap,
  ChainMetadata,
  ChainMetadataSchema,
} from '@hyperlane-xyz/sdk';
import { z } from 'zod';

import { registryUrl } from './config';
import { customChains } from './consts';

export default async function assembleChainMetadata() {
  const result = z.record(ChainMetadataSchema).safeParse({
    ...customChains,
  });

  if (!result.success) {
    throw new Error(`Invalid chain config: ${result.error.toString()}`);
  }

  const customChainMetadata = result.data as ChainMap<ChainMetadata>;

  const registry = new GithubRegistry({ uri: registryUrl });

  const chains = customChainMetadata;

  return { chains, registry };
}
