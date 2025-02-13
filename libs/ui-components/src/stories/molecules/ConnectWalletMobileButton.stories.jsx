import { ConnectWalletMobileButton } from '../../components/ConnectWalletMobileButton';

export default {
  title: 'Design System/Molecules/ConnectWalletMobileButton',
  component: ConnectWalletMobileButton,
};

const Template = (args) => <ConnectWalletMobileButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  className: 'lg:flex',
};
