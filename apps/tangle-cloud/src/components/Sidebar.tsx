'use client';

import CommandFillIcon from '@tangle-network/icons/CommandFillIcon';
import { DocumentationIcon } from '@tangle-network/icons/DocumentationIcon';
import GlobalLine from '@tangle-network/icons/GlobalLine';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
import {
  Dropdown,
  DropdownBody,
  DropdownButton,
  DropdownMenuItem,
} from '@tangle-network/ui-components/components/Dropdown';
import {
  MobileSidebar,
  SideBar as SideBarCmp,
  SideBarFooterType,
  SideBarItemProps,
  SidebarTangleClosedIcon,
} from '@tangle-network/ui-components/components/SideBar';
import { TangleCloudLogo } from '@tangle-network/ui-components/components/TangleCloudLogo';
import {
  TANGLE_DAPP_URL,
  TANGLE_DOCS_URL,
} from '@tangle-network/ui-components/constants';
import capitalize from 'lodash/capitalize';
import { FC, useMemo } from 'react';
import { useLocation } from 'react-router';
import useRoleStore, { Role, ROLE_ICON_MAP } from '../stores/roleStore';
import { PagePath } from '../types';
import { ChevronRight, HomeFillIcon } from '@tangle-network/icons';

type Props = {
  isExpandedByDefault?: boolean;
};

const SIDEBAR_ITEMS: SideBarItemProps[] = [
  {
    name: 'Home',
    href: PagePath.INSTANCES,
    isInternal: true,
    Icon: HomeFillIcon,
    subItems: [],
  },
  {
    name: 'Blueprints',
    href: PagePath.BLUEPRINTS,
    isInternal: true,
    Icon: GridFillIcon,
    subItems: [],
  },
  {
    name: 'Operators',
    href: PagePath.OPERATORS,
    isInternal: true,
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
};

const ActionButton: FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
  const { role, setRole } = useRoleStore();

  const capitalizedRole = useMemo(() => capitalize(role), [role]);

  return (
    <Dropdown>
      <DropdownButton
        isFullWidth
        size="md"
        icon={ROLE_ICON_MAP[role]({ size: 'lg' })}
        iconClassName="text-mono-0"
        isHideArrowIcon={!isExpanded}
        label={isExpanded ? capitalizedRole : ''}
        labelClassName="text-mono-0"
        arrowElement={<ChevronRight className="fill-mono-0" />}
        className="w-full px-4 py-4 !rounded-full normal-case border-none !bg-purple-50 justify-center font-bold text-mono-0"
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
  const pathname = useLocation().pathname;

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
