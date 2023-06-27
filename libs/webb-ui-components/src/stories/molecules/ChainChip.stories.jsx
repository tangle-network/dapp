import React from 'react';

import { ChainChip } from '../../components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/ChainChip',
  component: ChainChip,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    type: {
      control: {
        type: 'select',
        options: [
          'polygon',
          'ethereum',
          'optimism',
          'kusama',
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
    name: {
      control: {
        type: 'select',
        options: [
          'polygon',
          'polygon mumbai',
          'ethereum',
          'goerli',
          'sepolia',
          'optimism',
          'optimism goerli',
          'kusama',
          'moonbeam',
          'moonbase alpha',
          'polkadot',
          'arbitrum',
          'arbitrum goerli',
          'avalanche',
          'avalanche fuji',
          'cosmos',
          'tangle',
          'scroll',
          'athena',
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
  type: 'ethereum',
  name: 'ethereum',
};

export const Polygon = Template.bind({});
Polygon.args = {
  type: 'polygon',
  name: 'polygon',
};

export const Cosmos = Template.bind({});
Cosmos.args = {
  type: 'cosmos',
  name: 'cosmos',
};
