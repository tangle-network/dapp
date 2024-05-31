import { AddressChip } from '../../components/AddressChip';

export default {
  title: 'Design System/Molecules/AddressChip',
  component: AddressChip,
};

const Template = (args) => <AddressChip {...args} />;

export const Default = Template.bind({});
Default.args = {
  address: '0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6',
};

export const NoteAccount = Template.bind({});
NoteAccount.args = {
  address: '0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6',
  isNoteAccount: true,
};
