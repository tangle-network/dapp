import { ChainChip } from '../../components/ChainChip';

export default {
  title: 'Design System/Molecules/ChainChip',
  component: ChainChip,
  argTypes: {
    chainType: {
      control: {
        type: 'select',
        options: [
          'arbitrum',
          'athena',
          'avalanche',
          'cosmos',
          'ethereum',
          'kusama',
          'moonbeam',
          'optimism',
          'polkadot',
          'polygon',
          'tangle',
          'scroll',
          'orbit',
          'webb-dev',
        ],
      },
    },
    chainName: {
      control: {
        type: 'select',
        options: [
          'arbitrum',
          'arbitrum goerli',
          'athena',
          'avalanche',
          'avalanche fuji',
          'cosmos',
          'ethereum',
          'ethereum goerli',
          'ethereum rinkeby',
          'ethereum sepolia',
          'kusama',
          'moonbeam',
          'moonbeam alpha',
          'optimism',
          'optimism goerli',
          'polkadot',
          'polygon',
          'polygon mumbai',
          'tangle',
          'scroll',
          'webb',
          'demeter',
          'hermes',
        ],
      },
    },
  },
};

const Template = (args) => <ChainChip {...args} />;

// ARBITRUM
export const Arbitrum = Template.bind({});
Arbitrum.args = {
  chainType: 'arbitrum',
  chainName: 'arbitrum',
};

export const ArbitrumGoerli = Template.bind({});
ArbitrumGoerli.args = {
  chainType: 'arbitrum',
  chainName: 'arbitrum goerli',
  title: 'goerli',
};

// ATHENA
export const Athena = Template.bind({});
Athena.args = {
  chainType: 'athena',
  chainName: 'athena',
};

// AVALANCHE
export const Avalanche = Template.bind({});
Avalanche.args = {
  chainType: 'avalanche',
  chainName: 'avalanche',
};

export const AvalancheFuji = Template.bind({});
AvalancheFuji.args = {
  chainType: 'avalanche',
  chainName: 'avalanche fuji',
  title: 'fuji',
};

// COSMOS
export const Cosmos = Template.bind({});
Cosmos.args = {
  chainType: 'cosmos',
  chainName: 'cosmos',
};

// ETHEREUM
export const Ethereum = Template.bind({});
Ethereum.args = {
  chainType: 'ethereum',
  chainName: 'ethereum',
};

export const Sepolia = Template.bind({});
Sepolia.args = {
  chainType: 'ethereum',
  chainName: 'sepolia',
};

export const Goerli = Template.bind({});
Goerli.args = {
  chainType: 'ethereum',
  chainName: 'goerli',
};

export const Rinkeby = Template.bind({});
Rinkeby.args = {
  chainType: 'ethereum',
  chainName: 'rinkeby',
};

// KUSAMA
export const Kusama = Template.bind({});
Kusama.args = {
  chainType: 'kusama',
  chainName: 'kusama',
};

// MOONBEAM
export const Moonbeam = Template.bind({});
Moonbeam.args = {
  chainType: 'moonbeam',
  chainName: 'moonbeam',
};

export const MoonbaseAlpha = Template.bind({});
MoonbaseAlpha.args = {
  chainType: 'moonbeam',
  chainName: 'moonbase alpha',
  title: 'alpha',
};

// OPTIMISM
export const Optimism = Template.bind({});
Optimism.args = {
  chainType: 'optimism',
  chainName: 'optimism',
};

export const OptimismGoerli = Template.bind({});
OptimismGoerli.args = {
  chainType: 'optimism',
  chainName: 'optimism goerli',
  title: 'goerli',
};

// POLKADOT
export const Polkadot = Template.bind({});
Polkadot.args = {
  chainType: 'polkadot',
  chainName: 'polkadot',
};

// POLYGON
export const Polygon = Template.bind({});
Polygon.args = {
  chainType: 'polygon',
  chainName: 'polygon',
};

export const PolygonMumbai = Template.bind({});
PolygonMumbai.args = {
  chainType: 'polygon',
  chainName: 'polygon mumbai',
  title: 'mumbai',
};

// SCROLL
export const Scroll = Template.bind({});
Scroll.args = {
  chainType: 'scroll',
  chainName: 'scroll',
};

// TANGLE
export const Tangle = Template.bind({});
Tangle.args = {
  chainType: 'tangle',
  chainName: 'tangle',
};

// Orbit Hermes
export const OrbitHermes = Template.bind({});
OrbitHermes.args = {
  chainType: 'orbit',
  title: 'hermes',
  chainName: 'hermes Orbit',
};

export const OrbitAthena = Template.bind({});
OrbitAthena.args = {
  chainType: 'orbit',
  title: 'athena',
  chainName: 'athena Orbit',
};

export const OrbitDemeter = Template.bind({});
OrbitDemeter.args = {
  chainType: 'orbit',
  title: 'demeter',
  chainName: 'demeter orbit',
};
