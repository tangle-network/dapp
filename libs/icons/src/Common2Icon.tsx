import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Common2Icon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 33 32',
    path: [
      <g clipPath="url(#prefix__clip0_1033_35916)" fill="currentColor">
        <path d="M11.086 16.135a10.283 10.283 0 011.02-4.41 10.256 10.256 0 012.812-3.541l-2.35-2.357a1.804 1.804 0 00-2.555 0l-8.862 8.886a1.814 1.814 0 000 2.562l8.862 8.886a1.804 1.804 0 002.554 0l2.171-2.181a10.273 10.273 0 01-3.652-7.845z" />
        <path d="M21.803 5.715a10.884 10.884 0 00-6.922 2.473l6.477 6.516a1.803 1.803 0 01.392 1.97c-.091.22-.224.419-.392.586l-6.655 6.691a10.895 10.895 0 007.1 2.605c5.926 0 10.736-4.66 10.736-10.413 0-5.754-4.82-10.428-10.736-10.428z" />
      </g>,
      <defs>
        <clipPath id="prefix__clip0_1033_35916">
          <path fill="#fff" transform="translate(.587)" d="M0 0h32v32H0z" />
        </clipPath>
      </defs>,
    ],
    displayName: 'Common2Icon',
  });
};
