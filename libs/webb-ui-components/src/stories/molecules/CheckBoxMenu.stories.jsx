import { FilterIcon } from '@webb-tools/icons';
import { CheckBoxMenu } from '../../components/CheckBoxMenu';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/CheckBoxMenu',
  component: CheckBoxMenu,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <CheckBoxMenu {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  label: 'Filter',
  icon: <FilterIcon />,
};
