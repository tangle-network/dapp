import { randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';
import { KeyStatusCard } from '../../components/KeyStatusCard';
import { withRouter } from 'storybook-addon-remix-react-router';

export default {
  title: 'Design System/Organisms/KeyStatusCard',
  component: KeyStatusCard,
  decorators: [withRouter],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <KeyStatusCard {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title: 'Active Key 2',
  titleInfo: 'The public key of the DKG protocol that is currently active.',
  sessionNumber: 3456,
  keyType: 'current',
  keyVal: '0x1234567890abcdef',
  startTime: randRecentDate(),
  endTime: randSoonDate(),
  authorities: new Set(['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY']),
  totalAuthorities: randNumber(10, 20),
  fullDetailUrl: 'https://webb.tools',
};
