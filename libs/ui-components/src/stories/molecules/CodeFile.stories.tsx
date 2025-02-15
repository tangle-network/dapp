import CodeFile from '../../components/CodeFile';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CodeFile> = {
  title: 'Design System/Molecules/CodeFile',
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof CodeFile>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <div className="h-[600px] overflow-auto">
      <CodeFile code={'contract A {}'} language="sol" isInNextProject={false} />
    </div>
  ),
};
