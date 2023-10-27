import type NextLink from 'next/link';
import { useMemo } from 'react';
import type { Link as ReactLink } from 'react-router-dom';
import type { PropsOf } from '../../types';
import type { SideBarExtraItemProps, SideBarItemProps } from './types';

type Props = SideBarItemProps & SideBarExtraItemProps;

function useLinkProps(
  args: Pick<Props, 'isInternal' | 'href' | 'isNext' | 'isDisabled'> & {
    hasSubItem?: boolean;
  }
) {
  const { isInternal, isNext, href, isDisabled, hasSubItem } = args;

  return useMemo(() => {
    if (isDisabled || hasSubItem) {
      return {};
    }

    if (!isInternal) {
      return {
        href,
        target: '_blank',
      } as const satisfies PropsOf<'a'>;
    }

    if (isInternal && isNext) {
      return {
        href,
        isInternal,
      } as const satisfies PropsOf<typeof NextLink> & { isInternal: true };
    }

    if (isInternal && !isNext) {
      return {
        to: href,
        isInternal,
      } as const satisfies PropsOf<typeof ReactLink> & { isInternal: true };
    }

    return {};
  }, [hasSubItem, href, isDisabled, isInternal, isNext]);
}

export default useLinkProps;
