import { TokenIcon } from '@webb-tools/icons';
import noop from 'lodash/noop';
import { TransactionProgressCard } from '../../containers/TransactionProgressCard';

export default {
  title: 'Design System/templates/TransactionProgressCard',
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
  wallets: {
    src: <TokenIcon name={'matic'} />,
    dist: <TokenIcon name={'ETH'} />,
  },
  label: {
    tokenURI: 'https://polygon.technology/',
    amount: '0.999',
    token: 'ETH/WEBB',
  },
  onDismiss: noop,
  footer: {
    isLoading: false,
    hasWarning: true,
    link: {
      uri: '#',
      text: (
        <>
          <span
            role="img"
            aria-label="Warning"
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
