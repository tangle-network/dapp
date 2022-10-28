import React from 'react';

import { NetworkThresholdsCard } from '@webb-dapp/webb-ui-components/components/NetworkThresholdsCard';
import { randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';
import { withRouter } from 'storybook-addon-react-router-v6';

export default {
  title: 'Design System/Organisms/NetworkThresholdsCard',
  component: NetworkThresholdsCard,
  decorators: [withRouter],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <NetworkThresholdsCard {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title: 'Network Thresholds',
  titleInfo: 'Network Thresholds',
  keygenThreshold: randNumber({ min: 2, max: 20 }),
  signatureThreshold: randNumber({ min: 2, max: 20 }),
  startTime: randRecentDate(),
  endTime: randSoonDate(),
  thresholdType: 'current',
  sessionNumber: randNumber({ min: 100, max: 1000 }),
  keyValue: '0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7',
  viewHistoryUrl: 'https://webb.tools',
};
