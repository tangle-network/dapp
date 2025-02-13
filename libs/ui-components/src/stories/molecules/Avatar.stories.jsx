import { Avatar } from '../../components/Avatar';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Avatar',
  component: Avatar,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Avatar {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  key: '2',
  size: 'md',
  src: 'https://webb-assets.s3.amazonaws.com/WebbLogo.svg',
  sourceVariant: 'address',
};

export const Small = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Small.args = {
  key: '2',
  size: 'sm',
  src: 'https://webb-assets.s3.amazonaws.com/WebbLogo.svg',
  sourceVariant: 'address',
};

export const Large = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Large.args = {
  key: '2',
  size: 'lg',
  src: 'https://webb-assets.s3.amazonaws.com/WebbLogo.svg',
  sourceVariant: 'address',
};
