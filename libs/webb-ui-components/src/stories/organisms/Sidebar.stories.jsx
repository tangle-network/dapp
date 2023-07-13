import { SideBar, Logo, LogoWithoutName } from '../../components';
import { ContrastTwoLine, Tangle, DocumentationIcon } from '@webb-tools/icons';

const items = [
  {
    name: 'Hubble',
    isInternal: true,
    href: '/bridge',
    Icon: ContrastTwoLine,
    subItems: [
      {
        name: 'Bridge',
        isInternal: true,
        href: '/bridge',
      },
      {
        name: 'Faucet',
        isInternal: false,
        href: 'https://develop--webb-faucet.netlify.app/',
      },
    ],
  },
  {
    name: 'Tangle Network',
    isInternal: true,
    href: '',
    Icon: Tangle,
    subItems: [
      {
        name: 'DKG Explorer',
        isInternal: false,
        href: 'https://stats.webb.tools/#/keys',
      },
      {
        name: 'Homepage',
        isInternal: false,
        href: 'https://tangle.webb.tools/',
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
  title: 'Design System/Organisms/SideBar',
  component: SideBar,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <SideBar {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  items: items,
  Logo: Logo,
  ClosedLogo: LogoWithoutName,
  logoLink: 'https://webb.tools/',
  footer: footer,
};
