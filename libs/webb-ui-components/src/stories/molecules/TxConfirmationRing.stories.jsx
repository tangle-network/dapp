import { TxConfirmationRing } from '../../components';

export default {
  title: 'Design System/Molecules/TxConfirmationRing',
  component: TxConfirmationRing,
};

const Template = (args) => <TxConfirmationRing {...args} />;

export const Default = Template.bind({});
Default.args = {
  poolName: 'webbETH',
  poolAddress: '0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6',
  source: {
    typedChainId: 1099511670889,
    address: '0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6',
  },
  dest: {
    typedChainId: 1099511707777,
    address: '0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6',
    isNoteAccount: true,
  },
};
