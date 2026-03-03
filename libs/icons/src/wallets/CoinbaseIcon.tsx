import { createIcon } from '../create-icon';
import { IconBase } from '../types';

export const CoinbaseIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    size: props.size ?? 'lg',
    displayName: 'CoinbaseIcon',
    path: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="5" fill="#0052FF" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM10.4 9.6C9.95817 9.6 9.6 9.95817 9.6 10.4V13.6C9.6 14.0418 9.95817 14.4 10.4 14.4H13.6C14.0418 14.4 14.4 14.0418 14.4 13.6V10.4C14.4 9.95817 14.0418 9.6 13.6 9.6H10.4Z"
          fill="white"
        />
      </svg>
    ),
  });
};
