import { Progress, SteppedProgress } from '../../components/Progress';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Progress',
  component: Progress,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Progress {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  size: 'md',
  value: '60',
};

export const WithMax = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithMax.args = {
  ...Default.args,
  max: '70',
};

export const SteppedProgressDefault = () => (
  <SteppedProgress className="max-w-xl" steps={8} />
);

export const SteppedProgressWithActiveStep = () => (
  <SteppedProgress className="max-w-xl" steps={8} activeStep={3} />
);

export const SteppedProgressCompleted = () => (
  <SteppedProgress className="max-w-xl" steps={8} activeStep={9} />
);

export const SteppedProgressPaused = () => (
  <SteppedProgress className="max-w-xl" steps={8} paused />
);

export const SteppedProgressPausedWithActiveStep = () => (
  <SteppedProgress className="max-w-xl" steps={8} activeStep={3} paused />
);
