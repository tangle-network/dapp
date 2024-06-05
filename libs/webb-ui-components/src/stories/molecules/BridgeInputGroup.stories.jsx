import { AmountInput } from '../../components/BridgeInputs/AmountInput';
import { BridgeInputGroup } from '../../components/BridgeInputs/BridgeInputGroup';
import { ChainInput } from '../../components/BridgeInputs/ChainInput';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/BridgeInputGroup',
  component: BridgeInputGroup,
};

export const OneItems = () => (
  <BridgeInputGroup>
    <AmountInput />
  </BridgeInputGroup>
);

export const TwoItems = () => (
  <BridgeInputGroup>
    <AmountInput />
    <ChainInput />
  </BridgeInputGroup>
);
