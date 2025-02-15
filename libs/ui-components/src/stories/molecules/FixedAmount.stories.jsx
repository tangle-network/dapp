import noop from 'lodash/noop';
import { FixedAmount } from '../../components/BridgeInputs/FixedAmount';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/FixedAmount',
  component: FixedAmount,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    value: {
      options: [0.1, 0.25, 0.5, 1],
      control: { type: 'radio', min: 0.1, max: 1, step: 2 },
    },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <FixedAmount {...args} />;

export const Default = Template.bind({});

// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  info: 'Fix amount',
  values: [0.1, 0.25, 0.5, 1],
  value: '0.1',
  onChange: { handleChange: noop },
};
