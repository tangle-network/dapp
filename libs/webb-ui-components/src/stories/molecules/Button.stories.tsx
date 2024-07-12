import { ArrowRight } from '@webb-tools/icons';
import type { Meta, StoryObj } from '@storybook/react';
import Button from '../../components/buttons/Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Molecules/Button',
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: () => <Button>Click Me</Button>,
};

export const Medium: Story = {
  render: () => <Button>Click Me</Button>,
};

export const WithLeftIcon: Story = {
  render: () => (
    <Button leftIcon={<ArrowRight className="!fill-current" />}>
      Click Me
    </Button>
  ),
};

export const WithRightIcon: Story = {
  render: () => (
    <Button rightIcon={<ArrowRight className="!fill-current" />}>
      Click Me
    </Button>
  ),
};

export const Small: Story = {
  render: () => <Button size="sm">Click Me</Button>,
};

export const SmallWithIcon: Story = {
  render: () => (
    <Button size="sm" leftIcon={<ArrowRight className="!fill-current" />}>
      Click Me
    </Button>
  ),
};

export const IsDisabled: Story = {
  render: () => <Button isDisabled>Click Me</Button>,
};

export const IsDisabledWithIcon: Story = {
  render: () => (
    <Button leftIcon={<ArrowRight className="!fill-current" />} isDisabled>
      Click Me
    </Button>
  ),
};

export const Secondary: Story = {
  render: () => <Button variant="secondary">Click Me</Button>,
};

export const SecondaryWithIcon: Story = {
  render: () => (
    <Button
      variant="secondary"
      leftIcon={<ArrowRight className="!fill-current" />}
    >
      Click Me
    </Button>
  ),
};

export const SecondarySmall: Story = {
  render: () => (
    <Button variant="secondary" size="sm">
      Click Me
    </Button>
  ),
};

export const SecondarySmallWithIcon: Story = {
  render: () => (
    <Button
      variant="secondary"
      size="sm"
      leftIcon={<ArrowRight className="!fill-current" />}
    >
      Click Me
    </Button>
  ),
};

export const SecondaryIsDisabled: Story = {
  render: () => (
    <Button variant="secondary" isDisabled>
      Click Me
    </Button>
  ),
};

export const SecondaryIsDisabledWithIcon: Story = {
  render: () => (
    <Button
      variant="secondary"
      leftIcon={<ArrowRight className="!fill-current" />}
      isDisabled
    >
      Click Me
    </Button>
  ),
};

export const Utility: Story = {
  render: () => <Button variant="utility">Click Me</Button>,
};

export const UtilityWithIcon: Story = {
  render: () => (
    <Button
      variant="utility"
      leftIcon={<ArrowRight className="!fill-current" />}
    >
      Click Me
    </Button>
  ),
};

export const UtilitySmall: Story = {
  render: () => (
    <Button variant="utility" size="sm">
      Click Me
    </Button>
  ),
};

export const UtilitySmallWithIcon: Story = {
  render: () => (
    <Button
      variant="utility"
      size="sm"
      leftIcon={<ArrowRight className="!fill-current" />}
    >
      Click Me
    </Button>
  ),
};

export const UtilityIsDisabled: Story = {
  render: () => (
    <Button variant="utility" isDisabled>
      Click Me
    </Button>
  ),
};

export const UtilityIsDisabledWithIcon: Story = {
  render: () => (
    <Button
      variant="utility"
      leftIcon={<ArrowRight className="!fill-current" />}
      isDisabled
    >
      Click Me
    </Button>
  ),
};

export const Link: Story = {
  render: () => <Button variant="link">Click Me</Button>,
};

export const LinkWithIcon: Story = {
  render: () => (
    <Button variant="link" leftIcon={<ArrowRight className="!fill-current" />}>
      Click Me
    </Button>
  ),
};

export const LinkSmall: Story = {
  render: () => (
    <Button variant="link" size="sm">
      Click Me
    </Button>
  ),
};

export const LinkSmallWithIcon: Story = {
  render: () => (
    <Button
      variant="link"
      size="sm"
      leftIcon={<ArrowRight className="!fill-current" />}
    >
      Click Me
    </Button>
  ),
};

export const LinkIsDisabled: Story = {
  render: () => (
    <Button variant="link" isDisabled>
      Click Me
    </Button>
  ),
};

export const LinkIsDisabledWithIcon: Story = {
  render: () => (
    <Button
      variant="link"
      leftIcon={<ArrowRight className="!fill-current" />}
      isDisabled
    >
      Click Me
    </Button>
  ),
};
