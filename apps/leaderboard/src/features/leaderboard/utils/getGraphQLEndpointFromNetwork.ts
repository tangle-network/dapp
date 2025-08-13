import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';

export const getGraphQLEndpointFromNetwork = (network: NetworkType) => {
  switch (network) {
    case 'MAINNET':
      return 'https://mainnet-gql.tangle.tools/graphql';
    case 'TESTNET':
      return 'https://testnet-gql.tangle.tools/graphql';
    default:
      throw new Error(`Invalid network: ${network}`);
  }
};
