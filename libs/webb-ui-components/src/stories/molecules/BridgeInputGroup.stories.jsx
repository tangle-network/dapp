import React from 'react';

import {
  BridgeInputGroup,
  AmountInput,
  ChainInput,
} from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/BridgeInputGroup',
  component: BridgeInputGroup,
};

export const OneItems = (args) => (
  <BridgeInputGroup>
    <AmountInput />
  </BridgeInputGroup>
);

export const TwoItems = (args) => (
  <BridgeInputGroup>
    <AmountInput />
    <ChainInput />
  </BridgeInputGroup>
);
