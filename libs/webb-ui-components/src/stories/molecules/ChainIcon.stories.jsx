import { ChainIcon } from '../../../../icons';

const Template = (args) => <ChainIcon {...args} />;

export default {
  title: 'Design System/Molecules/ChainIcon',
  component: ChainIcon,
  argTypes: {
    name: {
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
          'scroll',
          'scroll alpha',
          'tangle',
          'webb',
          'demeter',
          'hermes',
        ],
      },
    },
  },
};

export const Arbitrum = Template.bind({});
Arbitrum.args = {
  name: 'arbitrum',
};

export const Athena = Template.bind({});
Athena.args = {
  name: 'athena',
};

export const Avalanche = Template.bind({});
Avalanche.args = {
  name: 'avalanche',
};

export const Cosmos = Template.bind({});
Cosmos.args = {
  name: 'cosmos',
};

export const Ethereum = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Ethereum.args = {
  name: 'ethereum',
};

export const Kusama = Template.bind({});
Kusama.args = {
  name: 'kusama',
};

export const Moonbeam = Template.bind({});
Moonbeam.args = {
  name: 'moonbeam',
};

export const Optimism = Template.bind({});
Optimism.args = {
  name: 'optimism',
};

export const Polkadot = Template.bind({});
Polkadot.args = {
  name: 'polkadot',
};

export const Polygon = Template.bind({});
Polygon.args = {
  name: 'polygon',
};

export const Scroll = Template.bind({});
Scroll.args = {
  name: 'scroll',
};

export const Tangle = Template.bind({});
Tangle.args = {
  name: 'tangle',
};

export const Webb = Template.bind({});
Webb.args = {
  name: 'webb',
};

export const Large = Template.bind({});
Large.args = {
  name: 'ethereum',
  size: 'lg',
};

export const ExtraLarge = Template.bind({});
ExtraLarge.args = {
  name: 'ethereum',
  size: 'xl',
};
