import { randEthereumAddress, randRecentDate } from '@ngneat/falso';
import { TimeLine, TimeLineItem } from '../../components/TimeLine';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/TimeLine',
  component: TimeLine,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <TimeLine>
    <TimeLineItem {...args} />{' '}
  </TimeLine>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title: 'Proposed',
  time: randRecentDate(),
  txHash: randEthereumAddress(),
  externalUrl: 'https://webb.tools',
};
