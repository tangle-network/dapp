import { useWebContext } from '@webb-tools/api-provider-environment';
import BillFillIcon from '@webb-tools/icons/BillFillIcon';
import { useNoteAccount } from '@webb-tools/react-hooks/useNoteAccount';
import type { SideBarItemProps } from '@webb-tools/webb-ui-components/components/SideBar/types';
import type { EventFor } from '@webb-tools/webb-ui-components/types';
import { useLocation } from 'react-router';
import sidebar from '../constants/sidebar';
import useChainsFromRoute from './useChainsFromRoute';
import { useConnectWallet } from './useConnectWallet';

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
  const { pathname } = useLocation();
  const { srcTypedChainId } = useChainsFromRoute();

  const { activeWallet, noteManager } = useWebContext();
  const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();
  const { toggleModal } = useConnectWallet();

  const handleClick = (event: EventFor<'a', 'onClick'>) => {
    event.preventDefault();

    if (typeof srcTypedChainId !== 'number') {
      return;
    }

    if (!activeWallet) {
      return toggleModal(true, srcTypedChainId);
    }

    if (!hasNoteAccount) {
      setOpenNoteAccountModal(true);
    }
  };

  const accountItem = {
    ...accountItemCfg,
    onClick: noteManager && activeWallet ? undefined : handleClick,
  } satisfies SideBarItemProps;

  sidebar.items = [
    accountItem,
    ...sidebar.items.filter((item) => item.name !== accountItem.name),
  ];

  return {
    ...sidebar,
    pathnameOrHash: pathname,
  } satisfies typeof sidebar;
}

export default useSidebarProps;
