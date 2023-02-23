import { createIcon } from './create-icon';
import { IconBase } from './types';

export const DeleteBinWithBg = (props: IconBase) => {
  return createIcon({
    ...props,
    path: [
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="18" height="18" rx="9" fill="#81B3F6" />
        <path
          d="M6.66671 6.00016V4.00016C6.66671 3.82335 6.73695 3.65378 6.86197 3.52876C6.98699 3.40373 7.15656 3.3335 7.33337 3.3335L12.6667 3.3335C12.8435 3.3335 13.0131 3.40373 13.1381 3.52876C13.2631 3.65378 13.3334 3.82335 13.3334 4.00016V6.00016H16.6667V7.3335H15.3334L15.3334 16.0002C15.3334 16.177 15.2631 16.3465 15.1381 16.4716C15.0131 16.5966 14.8435 16.6668 14.6667 16.6668H5.33337C5.15656 16.6668 4.98699 16.5966 4.86197 16.4716C4.73695 16.3465 4.66671 16.177 4.66671 16.0002L4.66671 7.3335H3.33337V6.00016H6.66671ZM8.00004 4.66683V6.00016L12 6.00016V4.66683L8.00004 4.66683Z"
          fill="#181F2B"
        />
        <rect
          x="1"
          y="1"
          width="18"
          height="18"
          rx="9"
          stroke="#81B3F6"
          stroke-width="2"
        />
      </svg>,
    ],
    displayName: 'DeleteBinWithBg',
  });
};
