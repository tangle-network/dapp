import { ShieldedAssetInput } from '../../components/BridgeInputs/ShieldedAssetInput';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/ShieldedAssetInput',
  component: ShieldedAssetInput,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ShieldedAssetInput {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};

export const WithAsset = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithAsset.args = {
  asset: {
    token1Symbol: 'webb',
    token2Symbol: 'eth',
    balance: 2.1,
    balanceInUsd: 100,
    symbol: 'ETH',
  },
};
