import React from 'react';

import { TokenIcon } from '@webb-dapp/webb-ui-components/icons';
import PolygonLogo from '@webb-dapp/apps/src/configs/logos/chains/PolygonLogo';
import { EthLogo } from '@webb-dapp/apps/src/configs/logos/chains';
import { TransactionProgressCard } from '@webb-dapp/webb-ui-components/containers/TransactionProgressCard';

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
  tokens: [<TokenIcon size={'lg'} name={'WEBB'} />, <TokenIcon size={'lg'} name={'ETH'} />],
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
