import { withRouter } from 'storybook-addon-remix-react-router';
import { WithdrawConfirm } from '../../containers/ConfirmationCard/WithdrawConfirm';
export default {
  title: 'Design System/Templates/WithdrawConfirm',
  component: WithdrawConfirm,
  decorators: [withRouter],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <div className="flex justify-center">
    <WithdrawConfirm {...args} />
  </div>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title: 'Withdraw In-Progress',
  activeChains: ['Optimism'],
  note: 'webb://v2:vanchor/1099511627780:109951123431284u182p347130287412083741289341238412472389741382974',
  amount: 1.01,
  changeAmount: 2.02,
  fee: 0.001,
  progress: 25,
  recipientAddress: '0xb507EcE3132875277d05045Bb1C914088A506443',
  fungibleTokenSymbol: 'eth',
  wrappableTokenSymbol: 'weth',
  relayerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  relayerExternalUrl: 'https://webb.tools',
  unshieldedAddress: '0xb507EcE3132875277d05045Bb1C914088A506443',
  destChain: 'Optimism',
};
