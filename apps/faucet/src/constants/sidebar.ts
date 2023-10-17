import { ContrastTwoLine } from '@webb-tools/icons/ContrastTwoLine';
import { DocumentationIcon } from '@webb-tools/icons/DocumentationIcon';
import { Tangle } from '@webb-tools/icons/Tangle';
import {
  type SideBarFooterType,
  type SideBarItemProps,
  type SidebarProps,
} from '@webb-tools/webb-ui-components';
import { Logo } from '@webb-tools/webb-ui-components/components/Logo';
import {
  DKG_STATS_URL,
  TANGLE_MKT_URL,
  WEBB_DOCS_URL,
  WEBB_MKT_URL,
  HUBBLE_STATS_URL,
  BRIDGE_URL,
} from '@webb-tools/webb-ui-components/constants';

const items: SideBarItemProps[] = [
  {
    name: 'Hubble',
    isInternal: true,
    href: '',
    Icon: ContrastTwoLine,
    subItems: [
      {
        name: 'Bridge',
        isInternal: false,
        href: BRIDGE_URL,
      },
      {
        name: 'Explorer',
        isInternal: false,
        href: HUBBLE_STATS_URL,
      },
      {
        name: 'Faucet',
        isInternal: true,
        href: '/',
      },
    ],
  },
  {
    name: 'Tangle Network',
    isInternal: false,
    href: '',
    Icon: Tangle,
    subItems: [
      {
        name: 'DKG Explorer',
        isInternal: false,
        href: DKG_STATS_URL,
      },
      {
        name: 'Homepage',
        isInternal: false,
        href: TANGLE_MKT_URL,
      },
    ],
  },
];

const footer: SideBarFooterType = {
  name: 'Webb Docs',
  isInternal: false,
  href: WEBB_DOCS_URL,
  Icon: DocumentationIcon,
  useNextThemesForThemeToggle: true,
};

const sidebar: SidebarProps = {
  Logo,
  items: items,
  footer: footer,
  logoLink: WEBB_MKT_URL,
};

export default sidebar;
