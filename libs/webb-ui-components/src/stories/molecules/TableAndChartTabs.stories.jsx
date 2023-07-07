import { TableAndChartTabs } from '@webb-tools/webb-ui-components/components';

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
  tabs: [
    {
      value: 'Tab 1',
      component: 'Tab 1 content',
    },
    {
      value: 'Tab 2',
      component: 'Tab 2 content',
    },
  ],
};

export const WithFilter = Template.bind({});
WithFilter.args = {
  tabs: [
    {
      value: 'Tab 1',
      component: 'Tab 1 content',
    },
    {
      value: 'Tab 2',
      component: 'Tab 2 content',
    },
  ],
  filterComponent: 'Filter component',
};
