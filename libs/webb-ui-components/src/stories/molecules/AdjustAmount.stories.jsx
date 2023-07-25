import { useState } from 'react';
import { AdjustAmount } from '../../components/BridgeInputs/AdjustAmount';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/v2/Molecules/AdjustAmount',
  component: AdjustAmount,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default = {
  args: {},
};

export const WithConstraints = {
  args: {
    min: 0,
    max: 5,
    step: 1,
  },
};

const Controlled_ = () => {
  const [value, setValue] = useState(0);
  return <AdjustAmount value={value} onChange={setValue} />;
};

export const Controlled = {
  render: () => <Controlled_ />,
};
