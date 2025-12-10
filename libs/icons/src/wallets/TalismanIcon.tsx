import { createIcon } from '../create-icon';
import { IconBase } from '../types';

export const TalismanIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    size: props.size ?? 'lg',
    displayName: 'TalismanIcon',
    path: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="5" fill="#D5FF5C" />
        <path
          d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
          fill="#FD4848"
        />
        <ellipse cx="9.5" cy="11" rx="1.5" ry="2" fill="white" />
        <ellipse cx="14.5" cy="11" rx="1.5" ry="2" fill="white" />
        <ellipse cx="9.5" cy="11" rx="0.75" ry="1" fill="black" />
        <ellipse cx="14.5" cy="11" rx="0.75" ry="1" fill="black" />
      </svg>
    ),
  });
};
