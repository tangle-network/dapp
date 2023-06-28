import { ChainChip } from '../../components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/ChainChip',
  component: ChainChip,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
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
          'webb-dev',
        ],
      },
    },
    iconName: {
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

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ChainChip {...args} />;

export const Arbitrum = Template.bind({});
Arbitrum.args = {
  chainType: 'arbitrum',
  iconName: 'arbitrum',
  title: 'Arbitrum',
};

export const Athena = Template.bind({});
Athena.args = {
  chainType: 'athena',
  iconName: 'athena',
  title: 'Athena',
};

export const Avalanche = Template.bind({});
Avalanche.args = {
  chainType: 'avalanche',
  iconName: 'avalanche',
  title: 'Avalanche',
};

export const Cosmos = Template.bind({});
Cosmos.args = {
  chainType: 'cosmos',
  iconName: 'cosmos',
  title: 'Cosmos',
};

export const Ethereum = Template.bind({});
Ethereum.args = {
  chainType: 'ethereum',
  iconName: 'ethereum',
  title: 'Ethereum',
};

export const Kusama = Template.bind({});
Kusama.args = {
  chainType: 'kusama',
  iconName: 'kusama',
  title: 'Kusama',
};

export const Moonbeam = Template.bind({});
Moonbeam.args = {
  chainType: 'moonbeam',
  iconName: 'moonbeam',
  title: 'Moonbeam',
};

export const Optimism = Template.bind({});
Optimism.args = {
  chainType: 'optimism',
  iconName: 'optimism',
  title: 'Optimism',
};

export const Polkadot = Template.bind({});
Polkadot.args = {
  chainType: 'polkadot',
  iconName: 'polkadot',
  title: 'Polkadot',
};

export const Polygon = Template.bind({});
Polygon.args = {
  chainType: 'polygon',
  iconName: 'polygon',
  title: 'Polygon',
};

export const Scroll = Template.bind({});
Scroll.args = {
  chainType: 'scroll',
  iconName: 'scroll',
  title: 'Scroll',
};

export const Tangle = Template.bind({});
Tangle.args = {
  chainType: 'tangle',
  iconName: 'tangle',
  title: 'Tangle',
};
