import { TableAndChartTabs } from '../../components/TableAndChartTabs';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/TableAndChartTabs',
  component: TableAndChartTabs,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <TableAndChartTabs {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  tabs: ['Tab 1', 'Tab 2'],
};

export const WithFilter = Template.bind({});
WithFilter.args = {
  tabs: ['Tab 1', 'Tab 2'],
  filterComponent: 'Filter component',
};
