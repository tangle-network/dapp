import React from 'react';

import { KeyStatusCard } from '@webb-dapp/webb-ui-components/components';
import { randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';

export default {
  title: 'Molecules/KeyStatusCard',
  component: KeyStatusCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  //   argTypes: {
  //     backgroundColor: { control: 'color' },
  //   },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <KeyStatusCard {...args}/>;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title:'Active Key',
  titleInfo:'The public key of the DKG protocol that is currently active.',
  sessionNumber:3456,
  keyType:'current',
  keyVal:'0x1234567890abcdef',
  startTime:randRecentDate(),
  endTime:randSoonDate(),
  authorities:{
    nepoche: {
      id: 'nepoche',
      avatarUrl: 'https://github.com/nepoche.png',
    },
    AhmedKorim: {
      id: 'AhmedKorim',
      avatarUrl: 'https://github.com/AhmedKorim.png',
    },
    AtelyPham: {
      id: 'AtelyPham',
      avatarUrl: 'https://github.com/AtelyPham.png',
    },
  },
  totalAuthorities:randNumber(10, 20),
  fullDetailUrl:'https://webb.tools'
};

// export const Large = Template.bind({});
// // More on args: https://storybook.js.org/docs/react/writing-stories/args
// Large.args = {
//   size: 'lg',
// };


