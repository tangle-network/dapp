import { useState } from 'react';
import { AdjustAmount } from '../../components/BridgeInputs/AdjustAmount';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/V2 (WIP)/Molecules/AdjustAmount',
  component: AdjustAmount,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

const style = {
  maxWidth: '160px',
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default = {
  args: {
    style,
  },
};

export const WithConstraints = {
  args: {
    style,
    min: 0,
    max: 5,
    step: 1,
  },
};

const ControlledComp = () => {
  const [value, setValue] = useState(0);
  return <AdjustAmount style={style} value={value} onChange={setValue} />;
};

export const Controlled = {
  render: () => <ControlledComp />,
};
