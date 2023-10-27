import { useWebContext } from '@webb-tools/api-provider-environment';
import BillFillIcon from '@webb-tools/icons/BillFillIcon';
import sidebar from '../constants/sidebar';
import type { SideBarItemProps } from '@webb-tools/webb-ui-components/components/SideBar/types';

const accountItemCfg = {
  name: 'Account',
  isInternal: true,
  href: '/account',
  Icon: BillFillIcon,
  subItems: [],
} satisfies SideBarItemProps;

/**
 * Function to get the sidebar props for the sidebar component.
 * **Must be used inside the `WebbProvider` component**.
 */
function useSidebarProps() {
  const { noteManager } = useWebContext();

  const accountItem = {
    ...accountItemCfg,
    info: noteManager?.getKeypair()
      ? undefined
      : 'Connect your wallet and create a note account to access this feature.',
    isDisabled: !noteManager?.getKeypair(),
  } satisfies SideBarItemProps;

  sidebar.items = [
    accountItem,
    ...sidebar.items.filter((item) => item.name !== accountItem.name),
  ];

  return sidebar;
}

export default useSidebarProps;
