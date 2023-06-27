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
          'polygon',
          'ethereum',
          'optimism',
          'kusama',
          'athena',
          'moonbeam',
          'polkadot',
          'arbitrum',
          'avalanche',
          'cosmos',
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

export const Ethereum = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Ethereum.args = {
  chainType: 'ethereum',
  iconName: 'ethereum',
  title: 'Ethereum',
};
