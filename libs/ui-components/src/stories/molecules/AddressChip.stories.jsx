import { AddressChip } from '../../components/AddressChip';

export default {
  title: 'Design System/Molecules/AddressChip',
  component: AddressChip,
};

const Template = (args) => <AddressChip {...args} />;

export const Default = Template.bind({});
Default.args = {
  address: '0x2DFA35bd8C59C38FB3eC4e71b0106160E130A40E',
};

export const NoteAccount = Template.bind({});
NoteAccount.args = {
  address: '0x2DFA35bd8C59C38FB3eC4e71b0106160E130A40E',
  isNoteAccount: true,
};
