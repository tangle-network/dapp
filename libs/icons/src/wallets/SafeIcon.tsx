import { createIcon } from '../create-icon';
import { IconBase } from '../types';

export const SafeIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    size: props.size ?? 'lg',
    displayName: 'SafeIcon',
    path: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="5" fill="#12FF80" />
        <path
          d="M5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5H16.5C17.6046 5.5 18.5 6.39543 18.5 7.5V16.5C18.5 17.6046 17.6046 18.5 16.5 18.5H7.5C6.39543 18.5 5.5 17.6046 5.5 16.5V7.5Z"
          stroke="#121312"
          strokeWidth="2"
        />
        <rect x="8" y="8" width="8" height="8" rx="1" fill="#121312" />
        <rect x="10" y="10" width="4" height="4" rx="0.5" fill="#12FF80" />
      </svg>
    ),
  });
};
