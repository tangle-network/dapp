import { ItemProps, FooterProps } from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';
import { ContrastTwoLine, DocumentationIcon, Tangle } from '@webb-tools/icons';
import {
  BRIDGE_URL,
  WEBB_FAUCET_URL,
  STATS_URL,
  TANGLE_MKT_URL,
  WEBB_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';

export const sidebarItems: ItemProps[] = [
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
        isInternal: true,
        href: '',
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
        href: STATS_URL,
      },
      {
        name: 'Homepage',
        isInternal: false,
        href: TANGLE_MKT_URL,
      },
    ],
  },
];

export const sidebarFooter: FooterProps = {
  name: 'Webb Docs',
  isInternal: false,
  href: WEBB_DOCS_URL,
  Icon: DocumentationIcon,
};
