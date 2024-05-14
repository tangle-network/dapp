import { ContrastTwoLine } from '@webb-tools/icons/ContrastTwoLine.js';
import { DocumentationIcon } from '@webb-tools/icons/DocumentationIcon.js';
import { Tangle } from '@webb-tools/icons/Tangle.js';
import {
  type SideBarFooterType,
  type SideBarItemProps,
  type SidebarProps,
} from '@webb-tools/webb-ui-components';
import { Logo } from '@webb-tools/webb-ui-components/components/Logo/index.js';
import {
  DKG_STATS_URL,
  HUBBLE_STATS_URL,
  TANGLE_MKT_URL,
  WEBB_DOCS_URL,
  WEBB_FAUCET_URL,
  WEBB_MKT_URL,
} from '@webb-tools/webb-ui-components/constants/index.js';
import { BRIDGE_PATH, WRAPPER_PATH } from './paths.js';

const items: SideBarItemProps[] = [
  {
    name: 'Hubble',
    isInternal: true,
    href: '',
    Icon: ContrastTwoLine,
    subItems: [
      {
        name: 'Bridge',
        isInternal: true,
        href: `/${BRIDGE_PATH}`,
      },
      {
        name: 'Wrapper',
        isInternal: true,
        href: `/${WRAPPER_PATH}`,
      },
      {
        name: 'Explorer',
        isInternal: false,
        href: HUBBLE_STATS_URL,
      },
      {
        name: 'Faucet',
        isInternal: false,
        href: WEBB_FAUCET_URL,
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
};

const sidebar: SidebarProps = {
  items: items,
  Logo: Logo,
  logoLink: WEBB_MKT_URL,
  footer: footer,
};

export default sidebar;
