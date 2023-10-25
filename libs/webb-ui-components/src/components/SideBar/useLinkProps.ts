import type NextLink from 'next/link';
import { useMemo } from 'react';
import type { Link as ReactLink } from 'react-router-dom';
import type { PropsOf } from '../../types';
import type { SideBarExtraItemProps, SideBarItemProps } from './types';

type Props = SideBarItemProps & SideBarExtraItemProps;

function useLinkProps(args: Pick<Props, 'isInternal' | 'href' | 'isNext'>) {
  const { isInternal, isNext, href } = args;

  return useMemo(() => {
    if (!isInternal) {
      return {
        href,
        isInternal,
        target: '_blank',
      } as const satisfies PropsOf<'a'> & { isInternal: false };
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
  }, [href, isInternal, isNext]);
}

export default useLinkProps;
