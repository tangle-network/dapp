'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { CaretSortIcon, HomeIcon } from '@radix-ui/react-icons';
import CommandFillIcon from '@webb-tools/icons/CommandFillIcon';
import { DocumentationIcon } from '@webb-tools/icons/DocumentationIcon';
import GlobalLine from '@webb-tools/icons/GlobalLine';
import { GridFillIcon } from '@webb-tools/icons/GridFillIcon';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
} from '@webb-tools/webb-ui-components/components/Dropdown';
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
import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import { usePathname } from 'next/navigation';
import { FC, useMemo } from 'react';
import useRoleStore, { Role, ROLE_ICON_MAP } from '../stores/roleStore';
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
  const { role, setRole } = useRoleStore();

  const capitalizedRole = useMemo(() => capitalize(role), [role]);

  return (
    <Dropdown>
      <DropdownMenuTrigger
        className={cx(
          'flex items-center',
          'rounded-full text-mono-100 dark:text-mono-120 px-2 py-3 block w-full',
          'focus:text-mono-200 focus:dark:text-mono-0',
          'focus:bg-mono-20 focus:dark:bg-mono-190',
          'hover:bg-mono-20 dark:hover:bg-mono-190',
          'data-[state=open]:bg-mono-20 data-[state=open]:dark:bg-mono-190',
          'data-[state=open]:text-mono-200 data-[state=open]:dark:text-mono-0',
          isExpanded ? 'justify-between' : 'justify-center',
        )}
      >
        {/* <Button
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
        </Button> */}

        <div className="flex items-center gap-2 !text-inherit">
          {ROLE_ICON_MAP[role]({ size: 'lg' })}
          {isExpanded ? capitalizedRole : ''}
        </div>

        {isExpanded && <CaretSortIcon width={24} height={24} />}
      </DropdownMenuTrigger>

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
