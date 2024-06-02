import { CardTable } from '../../components/CardTable';
import { Filter } from '../../components/Filter';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/CardTable',
  component: CardTable,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <CardTable
    {...args}
    leftTitle={<Filter searchPlaceholder={'Search  authority account'} />}
  ></CardTable>
);

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  titleProps: {
    title: 'DKG Authorities',
    info: 'DKG Authorities',
    variant: 'h5',
  },
};
