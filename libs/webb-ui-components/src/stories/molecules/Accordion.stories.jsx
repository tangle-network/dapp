import React from 'react';

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionContent,
} from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Accordion',
  component: Accordion,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <Accordion {...args}>
    <AccordionItem value={'helper1'}>
      <AccordionButton>Helper 1</AccordionButton>
      <AccordionContent>Accordion content for helper 1</AccordionContent>
    </AccordionItem>
    <AccordionItem value={'helper2'}>
      <AccordionButton>Helper 2</AccordionButton>
      <AccordionContent>Accordion content for helper 2</AccordionContent>
    </AccordionItem>
  </Accordion>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};

export const Multiple = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Multiple.args = {
  type: 'multiple',
};

export const DefaultItem = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
DefaultItem.args = {
  type: 'multiple',
  defaultValue: 'helper2',
};

export const WithValue = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithValue.args = {
  type: 'multiple',
  value: ['helper1', 'helper2'],
};
