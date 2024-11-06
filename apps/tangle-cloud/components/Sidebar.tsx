'use client';

import cx from 'classnames';
import { HomeIcon } from '@radix-ui/react-icons';
import { ArrowRight } from '@webb-tools/icons';
import CommandFillIcon from '@webb-tools/icons/CommandFillIcon';
import { DocumentationIcon } from '@webb-tools/icons/DocumentationIcon';
import GlobalLine from '@webb-tools/icons/GlobalLine';
import { GridFillIcon } from '@webb-tools/icons/GridFillIcon';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import {
  SideBar as SideBarCmp,
  SideBarFooterType,
  SideBarItemProps,
  SideBarMenu,
  SidebarTangleClosedIcon,
} from '@webb-tools/webb-ui-components/components/SideBar';
import { TangleCloudLogo } from '@webb-tools/webb-ui-components/components/TangleCloudLogo';
import {
  TANGLE_DAPP_URL,
  TANGLE_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';
import { setSidebarCookieOnToggle } from '@webb-tools/webb-ui-components/next-utils';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { PagePath } from '../types';

type Props = {
  isExpandedAtDefault?: boolean;
};

const SIDEBAR_ITEMS: SideBarItemProps[] = [
  {
    name: 'Home',
    href: PagePath.HOME,
    isInternal: true,
    isNext: true,
    Icon: HomeIcon,
    subItems: [],
  },
  {
    name: 'Blueprints',
    href: PagePath.BLUEPRINTS,
    isInternal: true,
    isNext: true,
    Icon: GridFillIcon,
    subItems: [],
  },
  {
    name: 'Operators',
    href: PagePath.OPERATORS,
    isInternal: true,
    isNext: true,
    Icon: GlobalLine,
    subItems: [],
  },

  // External links
  {
    Icon: CommandFillIcon,
    href: TANGLE_DAPP_URL,
    isInternal: false,
    name: 'dApp',
    subItems: [],
  },
];

const SIDEBAR_FOOTER: SideBarFooterType = {
  Icon: DocumentationIcon,
  href: TANGLE_DOCS_URL,
  isInternal: false,
  name: 'Docs',
  useNextThemesForThemeToggle: true,
};

const ActionButton: FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
  return (
    <Button
      title="Operate"
      isFullWidth
      rightIcon={<ArrowRight size="lg" className="!fill-mono-0" />}
      className={cx(!isExpanded && '!p-2')}
    >
      {isExpanded ? 'Operate' : ''}
    </Button>
  );
};

const Sidebar: FC<Props> = ({ isExpandedAtDefault }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Large screen sidebar */}
      <SideBarCmp
        ClosedLogo={SidebarTangleClosedIcon}
        items={SIDEBAR_ITEMS}
        footer={SIDEBAR_FOOTER}
        Logo={TangleCloudLogo}
        logoLink={pathname}
        pathnameOrHash={pathname}
        className="hidden lg:block"
        isExpandedAtDefault={isExpandedAtDefault}
        onSideBarToggle={setSidebarCookieOnToggle}
        ActionButton={ActionButton}
      />

      {/* Small screen sidebar */}
      <SideBarMenu
        ClosedLogo={SidebarTangleClosedIcon}
        items={SIDEBAR_ITEMS}
        footer={SIDEBAR_FOOTER}
        Logo={TangleCloudLogo}
        logoLink={pathname}
        pathnameOrHash={pathname}
        className="fixed top-4 left-5 lg:hidden"
        ActionButton={ActionButton}
      />
    </>
  );
};

export default Sidebar;
