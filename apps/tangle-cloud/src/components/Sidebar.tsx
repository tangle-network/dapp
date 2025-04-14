'use client';

import CommandFillIcon from '@tangle-network/icons/CommandFillIcon';
import { DocumentationIcon } from '@tangle-network/icons/DocumentationIcon';
import GlobalLine from '@tangle-network/icons/GlobalLine';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
// import {
//   Dropdown,
//   DropdownBody,
//   DropdownButton,
//   DropdownMenuItem,
// } from '@tangle-network/ui-components/components/Dropdown';
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
// import capitalize from 'lodash/capitalize';
import { FC } from 'react';
import { useLocation } from 'react-router';
// import useRoleStore, { Role, ROLE_ICON_MAP } from '../stores/roleStore';
import { PagePath } from '../types';
import { HomeFillIcon, UserLineIcon } from '@tangle-network/icons';
// import { twMerge } from 'tailwind-merge';
// import cx from 'classnames';

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
  {
    name: 'Account',
    href: PagePath.ACCOUNT,
    isInternal: true,
    Icon: UserLineIcon,
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

// const ActionButton: FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
//   const { role, setRole } = useRoleStore();

//   const capitalizedRole = useMemo(() => capitalize(role), [role]);

//   return (
//     <Dropdown>
//       <DropdownButton
//         icon={ROLE_ICON_MAP[role]({ size: 'lg' })}
//         isHideArrowIcon={!isExpanded}
//         arrowElement={<ChevronRight size="lg" />}
//         className={twMerge(
//           'px-3 py-3 !rounded-full border-none',
//           '!bg-purple-50 font-bold text-mono-0',
//           'w-full',
//         )}
//       >
//         <span>{isExpanded ? capitalizedRole : ''}</span>
//       </DropdownButton>

//       <DropdownBody
//         isPortal={false}
//         sideOffset={8}
//         side="right"
//         className="z-[60]"
//         align="center"
//       >
//         <DropdownMenuItem
//           isActive={role === Role.OPERATOR}
//           onClick={() => setRole(Role.OPERATOR)}
//           leftIcon={ROLE_ICON_MAP[Role.OPERATOR]()}
//         >
//           Operate
//         </DropdownMenuItem>
//         <DropdownMenuItem
//           isActive={role === Role.DEPLOYER}
//           onClick={() => setRole(Role.DEPLOYER)}
//           leftIcon={ROLE_ICON_MAP[Role.DEPLOYER]()}
//         >
//           Deploy
//         </DropdownMenuItem>
//       </DropdownBody>
//     </Dropdown>
//   );
// };

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
        pathnameOrHash={pathname}
        className="hidden h-screen lg:block"
        isExpandedByDefault={isExpandedByDefault}
        // ActionButton={ActionButton}
      />

      {/* Small screen sidebar */}
      <MobileSidebar
        ClosedLogo={SidebarTangleClosedIcon}
        items={SIDEBAR_ITEMS}
        footer={SIDEBAR_FOOTER}
        Logo={TangleCloudLogo}
        pathnameOrHash={pathname}
        className="fixed top-[34px] left-4 md:left-8 lg:hidden"
        // ActionButton={ActionButton}
      />
    </>
  );
};

export default Sidebar;
