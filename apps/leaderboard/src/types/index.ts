import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';

export type Network = 'all' | NetworkType.Testnet | NetworkType.Mainnet;
