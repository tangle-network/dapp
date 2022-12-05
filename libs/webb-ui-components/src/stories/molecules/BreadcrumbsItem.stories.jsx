import { BreadcrumbsItem } from '@webb-tools/webb-ui-components';
import { UserStarFillIcon } from '@webb-tools/icons';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/BreadcrumbsItem',
  component: BreadcrumbsItem,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <BreadcrumbsItem {...args.props}>{args.children}</BreadcrumbsItem>
);

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  children: 'Item',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  props: {
    icon: <UserStarFillIcon />,
  },
  children: 'Item',
};

export const IsALastItem = Template.bind({});
IsALastItem.args = {
  props: {
    icon: <UserStarFillIcon />,
    isLast: true,
  },
  children: 'Item',
};
