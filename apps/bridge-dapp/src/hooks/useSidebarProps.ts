import { useWebContext } from '@webb-tools/api-provider-environment';
import BillFillIcon from '@webb-tools/icons/BillFillIcon';
import sidebar from '../constants/sidebar';
import type { SideBarItemProps } from '@webb-tools/webb-ui-components/components/SideBar/types';

const accountItem = {
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
  const info = noteManager?.getKeypair()
    ? undefined
    : 'Connect your wallet and create a note account to access this feature.';

  sidebar.items = [
    {
      ...accountItem,
      info,
    },
    ...sidebar.items.filter((item) => item.name !== accountItem.name),
  ];

  return sidebar;
}

export default useSidebarProps;
