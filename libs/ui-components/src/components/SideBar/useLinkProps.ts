import { useMemo } from 'react';
import type { Link as ReactLink } from 'react-router';
import type { PropsOf } from '../../types';
import type { SideBarExtraItemProps, SideBarItemProps } from './types';

type Props = SideBarItemProps & SideBarExtraItemProps;

function useLinkProps(
  args: Pick<Props, 'isInternal' | 'href' | 'isDisabled' | 'onClick'> & {
    hasSubItem?: boolean;
  },
) {
  const { isInternal, href, isDisabled, hasSubItem, onClick } = args;

  return useMemo(() => {
    if (isDisabled || hasSubItem) {
      return {};
    }

    if (!isInternal) {
      return {
        href,
        target: '_blank',
        onClick,
      } as const satisfies PropsOf<'a'>;
    } else {
      return {
        to: href,
        isInternal,
        onClick,
      } as const satisfies PropsOf<typeof ReactLink> & { isInternal: true };
    }
  }, [hasSubItem, href, isDisabled, isInternal, onClick]);
}

export default useLinkProps;
