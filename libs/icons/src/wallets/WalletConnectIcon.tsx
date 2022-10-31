import { createIcon } from '../create-icon';
import { IconBase } from '../types';

export const WalletConnectIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    size: props.size ?? 'lg', // Override the default size to `lg` (24px)
    displayName: 'WalletConnectIcon',
    path: (
      <>
        <rect width={24} height={24} rx={8} fill='#3B99FC' />
        <path
          d='M7.191 8.892a6.8 6.8 0 019.618 0l.32.32a.34.34 0 010 .48l-1.094 1.094a.17.17 0 01-.24 0l-.44-.44a4.744 4.744 0 00-6.71 0l-.47.47a.17.17 0 01-.241 0L6.84 9.724a.34.34 0 010-.48l.351-.351zm11.88 2.261l.972.973a.34.34 0 010 .481l-4.388 4.388a.34.34 0 01-.48 0l-3.115-3.114a.085.085 0 00-.12 0l-3.114 3.114a.34.34 0 01-.481 0l-4.388-4.388a.34.34 0 010-.48l.973-.974a.34.34 0 01.48 0l3.115 3.114a.085.085 0 00.12 0l3.114-3.114a.34.34 0 01.481 0l3.115 3.114a.085.085 0 00.12 0l3.114-3.114a.34.34 0 01.481 0z'
          fill='#fff'
        />
      </>
    ),
  });
};
