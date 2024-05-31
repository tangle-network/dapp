import { ChainInput } from '../../components/BridgeInputs/ChainInput';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/ChainInput',
  component: ChainInput,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ChainInput {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};

export const AsDestinationChain = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
AsDestinationChain.args = {
  chainType: 'dest',
  chain: {
    name: 'Optimism',
    symbol: 'op',
  },
};

export const AsSourceChain = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
AsSourceChain.args = {
  chainType: 'source',
  chain: {
    name: 'Ethereum',
    symbol: 'eth',
  },
};
