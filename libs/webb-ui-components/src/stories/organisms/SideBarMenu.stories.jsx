import { SideBarMenu, Logo, LogoWithoutName } from '../../components';
import { ContrastTwoLine, Tangle, DocumentationIcon } from '@webb-tools/icons';

const items = [
  {
    name: 'Hubble',
    isInternal: true,
    Icon: ContrastTwoLine,
    subItems: [
      {
        name: 'Bridge',
        isInternal: true,
      },
      {
        name: 'Faucet',
        isInternal: false,
      },
    ],
  },
  {
    name: 'Tangle Network',
    isInternal: true,
    Icon: Tangle,
    subItems: [
      {
        name: 'DKG Explorer',
        isInternal: false,
      },
      {
        name: 'Homepage',
        isInternal: false,
      },
    ],
  },
];

const footer = {
  name: 'Webb Docs',
  isInternal: false,
  href: 'https://docs.webb.tools/',
  Icon: DocumentationIcon,
};

export default {
  title: 'Design System/Organisms/SideBarMenu',
  component: SideBarMenu,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <SideBarMenu {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  items: items,
  Logo: Logo,
  ClosedLogo: LogoWithoutName,
  logoLink: 'https://webb.tools/',
  footer: footer,
};
