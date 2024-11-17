'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { HomeIcon, PersonIcon } from '@radix-ui/react-icons';
import { ArrowRight } from '@webb-tools/icons';
import CommandFillIcon from '@webb-tools/icons/CommandFillIcon';
import { DocumentationIcon } from '@webb-tools/icons/DocumentationIcon';
import GlobalLine from '@webb-tools/icons/GlobalLine';
import { GridFillIcon } from '@webb-tools/icons/GridFillIcon';
import { getIconSizeInPixel } from '@webb-tools/icons/utils';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import {
  SideBar as SideBarCmp,
  SideBarFooterType,
  SideBarItemProps,
  MobileSidebar,
  SidebarTangleClosedIcon,
} from '@webb-tools/webb-ui-components/components/SideBar';
import { TangleCloudLogo } from '@webb-tools/webb-ui-components/components/TangleCloudLogo';
import {
  TANGLE_DAPP_URL,
  TANGLE_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';
import { setSidebarCookieOnToggle } from '@webb-tools/webb-ui-components/next-utils';
import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import { usePathname } from 'next/navigation';
import { FC, useMemo } from 'react';
import useRoleStore, { Role } from '../stores/roleStore';
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
      <DropdownMenuTrigger asChild>
        <Button
          title={capitalizedRole}
          isFullWidth
          rightIcon={
            isExpanded ? (
              <ArrowRight size="lg" className="!fill-mono-0" />
            ) : (
              <PersonIcon
                width={getIconSizeInPixel('lg')}
                height={getIconSizeInPixel('lg')}
              />
            )
          }
          className={cx(!isExpanded && '!p-2')}
        >
          {isExpanded ? capitalizedRole : ''}
        </Button>
      </DropdownMenuTrigger>

      <DropdownBody
        className={cx('mt-2', isExpanded && 'w-[248px]')}
        align="center"
      >
        <DropdownMenuItem
          isActive={role === Role.OPERATOR}
          onClick={() => setRole(Role.OPERATOR)}
        >
          Operate
        </DropdownMenuItem>
        <DropdownMenuItem
          isActive={role === Role.DEPLOYER}
          onClick={() => setRole(Role.DEPLOYER)}
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
        className="hidden lg:block"
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
        className="fixed top-4 left-5 lg:hidden"
        ActionButton={ActionButton}
      />
    </>
  );
};

export default Sidebar;
