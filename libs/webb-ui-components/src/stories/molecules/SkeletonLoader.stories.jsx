import { SkeletonLoader } from '../../components/SkeletonLoader';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/SkeletonLoader',
  component: SkeletonLoader,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <SkeletonLoader {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};

export const Large = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Large.args = {
  size: 'lg',
};

export const ExtraLarge = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ExtraLarge.args = {
  size: 'xl',
};
