import { chainMetadata, GithubRegistry } from '@hyperlane-xyz/registry';
import {
  ChainMap,
  ChainMetadata,
  ChainMetadataSchema,
  ChainTechnicalStack,
} from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';
import { z } from 'zod';

import { registryUrl } from './config';
import { customChains } from './consts';

export default async function assembleChainMetadata() {
  const result = z.record(ChainMetadataSchema).safeParse({
    // Note: Chains must include a cosmos chain or CosmosKit throws errors
    cosmoshub: cosmosDefaultChain,
    ...customChains,
  });

  if (!result.success) {
    throw new Error(`Invalid chain config: ${result.error.toString()}`);
  }

  const customChainMetadata = result.data as ChainMap<ChainMetadata>;

  const registry = new GithubRegistry({ uri: registryUrl });
  let defaultChainMetadata = chainMetadata;
  if (registryUrl) {
    defaultChainMetadata = await registry.getMetadata();
  } else {
    // Note: this is an optional optimization to pre-fetch the content list
    // and avoid repeated request from the chain logos that will use this info
    await registry.listRegistryContent();
  }

  const chains = { ...defaultChainMetadata, ...customChainMetadata };

  // Handle invalid ChainTechnicalStack values - ex: opstack
  Object.entries(chains).forEach(([_chainName, chain]) => {
    if (
      typeof chain.technicalStack === 'string' &&
      !Object.values(ChainTechnicalStack).includes(chain.technicalStack)
    ) {
      chain.technicalStack = ChainTechnicalStack.Other;
    }
  });

  return { chains, registry };
}

const cosmosDefaultChain: ChainMetadata = {
  protocol: ProtocolType.Cosmos,
  name: 'cosmoshub',
  chainId: 'cosmoshub-4',
  displayName: 'Cosmos Hub',
  domainId: 1234,
  bech32Prefix: 'cosmos',
  slip44: 118,
  grpcUrls: [{ http: 'grpc-cosmoshub-ia.cosmosia.notional.ventures:443' }],
  rpcUrls: [{ http: 'https://rpc-cosmoshub.blockapsis.com' }],
  restUrls: [{ http: 'https://lcd-cosmoshub.blockapsis.com' }],
  nativeToken: {
    name: 'Atom',
    symbol: 'ATOM',
    decimals: 6,
    denom: 'uatom',
  },
  logoURI: '/logos/cosmos.svg',
};
