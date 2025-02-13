'use client';

import { HomeIcon } from '@radix-ui/react-icons';
import CommandFillIcon from '@tangle-network/icons/CommandFillIcon';
import { DocumentationIcon } from '@tangle-network/icons/DocumentationIcon';
import GlobalLine from '@tangle-network/icons/GlobalLine';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
import {
  Dropdown,
  DropdownBody,
  DropdownButton,
  DropdownMenuItem,
} from '@tangle-network/webb-ui-components/components/Dropdown';
import {
  MobileSidebar,
  SideBar as SideBarCmp,
  SideBarFooterType,
  SideBarItemProps,
  SidebarTangleClosedIcon,
} from '@tangle-network/webb-ui-components/components/SideBar';
import { TangleCloudLogo } from '@tangle-network/webb-ui-components/components/TangleCloudLogo';
import {
  TANGLE_DAPP_URL,
  TANGLE_DOCS_URL,
} from '@tangle-network/webb-ui-components/constants';
import { setSidebarCookieOnToggle } from '@tangle-network/webb-ui-components/next-utils';
import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import { usePathname } from 'next/navigation';
import { FC, useMemo } from 'react';
import useRoleStore, { Role, ROLE_ICON_MAP } from '../stores/roleStore';
import { PagePath } from '../types';

type Props = {
  isExpandedByDefault?: boolean;
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
  const { role, setRole } = useRoleStore();

  const capitalizedRole = useMemo(() => capitalize(role), [role]);

  return (
    <Dropdown>
      <DropdownButton
        isFullWidth
        size="sm"
        icon={ROLE_ICON_MAP[role]({ size: 'lg' })}
        hideChevron={!isExpanded}
        label={isExpanded ? capitalizedRole : ''}
        className={cx('min-w-0 mx-auto', !isExpanded && 'px-2 w-fit')}
      />

      <DropdownBody className="ml-2" side="right" align="center">
        <DropdownMenuItem
          isActive={role === Role.OPERATOR}
          onClick={() => setRole(Role.OPERATOR)}
          leftIcon={ROLE_ICON_MAP[Role.OPERATOR]()}
        >
          Operate
        </DropdownMenuItem>
        <DropdownMenuItem
          isActive={role === Role.DEPLOYER}
          onClick={() => setRole(Role.DEPLOYER)}
          leftIcon={ROLE_ICON_MAP[Role.DEPLOYER]()}
        >
          Deploy
        </DropdownMenuItem>
      </DropdownBody>
    </Dropdown>
  );
};

const Sidebar: FC<Props> = ({ isExpandedByDefault }) => {
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
        className="hidden h-screen lg:block"
        isExpandedByDefault={isExpandedByDefault}
        onSideBarToggle={setSidebarCookieOnToggle}
        ActionButton={ActionButton}
      />

      {/* Small screen sidebar */}
      <MobileSidebar
        ClosedLogo={SidebarTangleClosedIcon}
        items={SIDEBAR_ITEMS}
        footer={SIDEBAR_FOOTER}
        Logo={TangleCloudLogo}
        logoLink={pathname}
        pathnameOrHash={pathname}
        className="fixed top-[34px] left-4 md:left-8 lg:hidden"
        ActionButton={ActionButton}
      />
    </>
  );
};

export default Sidebar;
