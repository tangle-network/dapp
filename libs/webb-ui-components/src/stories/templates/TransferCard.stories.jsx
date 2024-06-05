import { withRouter } from 'storybook-addon-remix-react-router';
import { TransferCard } from '../../containers/TransferCard';
export default {
  title: 'Design System/Templates/TransferCard',
  component: TransferCard,
  decorators: [withRouter],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <div className="flex justify-center">
    <TransferCard {...args} />
  </div>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  className: 'mx-auto',
};
