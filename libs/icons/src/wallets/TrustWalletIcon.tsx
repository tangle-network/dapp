import { createIcon } from '../create-icon';
import { IconBase } from '../types';

export const TrustWalletIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    size: props.size ?? 'lg',
    displayName: 'TrustWalletIcon',
    path: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="5" fill="#0500FF" />
        <path
          d="M12 4C8.5 4 6 6.5 6 6.5V12C6 16 9 19 12 20C15 19 18 16 18 12V6.5C18 6.5 15.5 4 12 4Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M12 7C9.5 7 8 8.5 8 8.5V12C8 14.5 10 17 12 18C14 17 16 14.5 16 12V8.5C16 8.5 14.5 7 12 7Z"
          fill="white"
        />
      </svg>
    ),
  });
};
