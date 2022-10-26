import React from 'react';

import { Pagination } from '@nepoche/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Pagination',
  component: Pagination,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Pagination {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Primary.args = {
  itemsPerPage: 10,
  totalItems: 50,
  page: 2,
  totalPages: 5,
  canPreviousPage: true,
  previousPage: 1,
  canNextPage: true,
  nextPage: 3,
  setPageIndex: 2,
};
