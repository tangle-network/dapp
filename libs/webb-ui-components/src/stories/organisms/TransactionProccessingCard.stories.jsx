import React from 'react';
import { TransactionProgressCard } from '../../containers/TransactionProgressCard';
import PolygonLogo from '@webb-tools/logos/src/chains/PolygonLogo';
import { TokenIcon } from '@webb-tools/icons';
import EthLogo from '@webb-tools/logos/src/chains/EthLogo';

export default {
  title: 'Design System/Organisms/TransactionProgressCard',
  component: TransactionProgressCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <TransactionProgressCard {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  method: 'Deposit',
  firedAt: new Date(),
  status: 'in-progress',
  tokens: [
    <TokenIcon size={'lg'} name={'WEBB'} />,
    <TokenIcon size={'lg'} name={'ETH'} />,
  ],
  wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
  label: {
    tokenURI: 'https://polygon.technology/',
    amount: '0.999',
    token: 'ETH/WEBB',
  },
  onDismiss: () => {},
  footer: {
    isLoading: false,
    hasWarning: true,
    link: {
      uri: '#',
      text: (
        <>
          <span
            className={'inline-block pr-2'}
            style={{
              fontSize: 18,
            }}
          >
            ⚠️
          </span>
          Deposit Failed
        </>
      ),
    },
  },
};
