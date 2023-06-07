import {
  BottomDialog,
  BottomDialogTrigger,
  BottomDialogPortal,
} from '@webb-tools/webb-ui-components/components';

export default {
  title: 'Design System/Molecules/BottomDialog',
  component: BottomDialog,
};

const Template = (args) => (
  <BottomDialog {...args}>
    <BottomDialogTrigger>
      <button>Open Bottom Dialog</button>
    </BottomDialogTrigger>
    <BottomDialogPortal
      className="w-full"
      title="Bottom Dialog"
      actionButtonsProps={[
        {
          children: 'Action 1',
          isFullWidth: true,
        },
        {
          children: 'Action 2',
          variant: 'secondary',
          isFullWidth: true,
        },
      ]}
    >
      This is a bottom dialog
    </BottomDialogPortal>
  </BottomDialog>
);

export const Default = Template.bind({});
Default.args = {};

const NoButtonTemplate = (args) => (
  <BottomDialog {...args}>
    <BottomDialogTrigger>
      <button>Open Bottom Dialog</button>
    </BottomDialogTrigger>
    <BottomDialogPortal className="w-full" title="Bottom Dialog">
      This is a bottom dialog
    </BottomDialogPortal>
  </BottomDialog>
);

export const NoButton = NoButtonTemplate.bind({});
NoButton.args = {};
