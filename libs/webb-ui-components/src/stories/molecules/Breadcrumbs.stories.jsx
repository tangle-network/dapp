import { Breadcrumbs, BreadcrumbsItem } from '@webb-tools/webb-ui-components';
import { GridFillIcon, KeyIcon, ShieldKeyholeIcon } from '@webb-tools/icons';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Breadcrumbs',
  component: Breadcrumbs,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <Breadcrumbs {...args}>
    <BreadcrumbsItem {...args.itemOneProps}>
      {args.itemOneChildren}
    </BreadcrumbsItem>
    <BreadcrumbsItem {...args.itemTwoProps}>
      {args.itemTwoChildren}
    </BreadcrumbsItem>
    <BreadcrumbsItem {...args.itemThreeProps}>
      {args.itemThreeChildren}
    </BreadcrumbsItem>
  </Breadcrumbs>
);

export const Default = Template.bind({});
Default.args = {
  itemOneProps: {
    icon: <GridFillIcon />,
  },
  itemOneChildren: 'Tangle Explorer',
  itemTwoProps: {
    icon: <KeyIcon />,
  },
  itemTwoChildren: 'Keys Overview',
  itemThreeProps: {
    icon: <ShieldKeyholeIcon />,
    isLast: true,
  },
  itemThreeChildren: 'Keygen details',
};

export const CustomSeparator = Template.bind({});
CustomSeparator.args = {
  itemOneProps: {
    icon: <GridFillIcon />,
  },
  itemOneChildren: 'Tangle Explorer',
  itemTwoProps: {
    icon: <KeyIcon />,
  },
  itemTwoChildren: 'Keys Overview',
  itemThreeProps: {
    icon: <ShieldKeyholeIcon />,
    isLast: true,
  },
  itemThreeChildren: 'Keygen details',
  separator: '>',
};
