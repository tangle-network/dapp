import { createIcon } from '@tangle-network/icons/create-icon';
import { IconBase } from '@tangle-network/icons/types';
import { twMerge } from 'tailwind-merge';

export const FirstPlaceIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 26 26',
    fill: 'none',
    className: twMerge(props.className, 'fill-none dark:fill-none'),
    path: (
      <>
        <g clipPath="url(#clip0_178_41550)">
          <path
            d="M25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25C19.6274 25 25 19.6274 25 13Z"
            fill="#FAB600"
            stroke="#FFF71D"
          />
          <path
            d="M24.5 13C24.5 6.7868 19.4632 1.75 13.25 1.75C7.0368 1.75 2 6.7868 2 13C2 19.2132 7.0368 24.25 13.25 24.25C19.4632 24.25 24.5 19.2132 24.5 13Z"
            fill="#FAB600"
            stroke="white"
            strokeOpacity="0.32"
            strokeWidth="1.5"
          />
          <path
            d="M12.4374 10.608H10.5174V9.228H13.9134V18H12.4374V10.608Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_178_41550">
            <rect width="26" height="26" fill="white" />
          </clipPath>
        </defs>
      </>
    ),
    displayName: 'FirstPlaceIcon',
  });
};

export const SecondPlaceIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 26 26',
    fill: 'none',
    className: twMerge(props.className, 'fill-none dark:fill-none'),
    path: (
      <>
        <g clipPath="url(#clip0_178_41561)">
          <path
            d="M25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25C19.6274 25 25 19.6274 25 13Z"
            fill="#9DA8B0"
            stroke="#E2E3E3"
          />
          <path
            d="M24.5 13C24.5 6.7868 19.4632 1.75 13.25 1.75C7.0368 1.75 2 6.7868 2 13C2 19.2132 7.0368 24.25 13.25 24.25C19.4632 24.25 24.5 19.2132 24.5 13Z"
            fill="#9DA8B0"
            stroke="white"
            strokeOpacity="0.32"
            strokeWidth="1.5"
          />
          <path
            d="M16.1028 17.988L10.0188 18V16.848L12.8868 14.424C14.0748 13.416 14.4708 12.84 14.4708 12C14.4708 11.004 13.9308 10.44 13.0068 10.44C12.0468 10.44 11.4468 11.112 11.4348 12.24H9.9108C9.9228 10.32 11.1468 9.072 13.0068 9.072C14.8788 9.072 16.0428 10.14 16.0428 11.916C16.0428 13.14 15.3708 14.064 14.0388 15.204L12.4548 16.56H16.1028V17.988Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_178_41561">
            <rect width="26" height="26" fill="white" />
          </clipPath>
        </defs>
      </>
    ),
    displayName: 'SecondPlaceIcon',
  });
};

export const ThirdPlaceIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 26 26',
    fill: 'none',
    className: twMerge(props.className, 'fill-none dark:fill-none'),
    path: (
      <>
        <g clipPath="url(#clip0_178_41572)">
          <path
            d="M25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25C19.6274 25 25 19.6274 25 13Z"
            fill="#D97D5E"
            stroke="#F4B791"
          />
          <path
            d="M24.5 13C24.5 6.7868 19.4632 1.75 13.25 1.75C7.0368 1.75 2 6.7868 2 13C2 19.2132 7.0368 24.25 13.25 24.25C19.4632 24.25 24.5 19.2132 24.5 13Z"
            fill="#D97D5E"
            stroke="white"
            strokeOpacity="0.32"
            strokeWidth="1.5"
          />
          <path
            d="M13.192 13.656H12.124V12.66L14.38 10.584H10.732V9.228H16.3V10.452L14.164 12.42C15.508 12.684 16.552 13.668 16.552 15.216C16.552 17.016 15.148 18.156 13.372 18.156C11.656 18.156 10.324 17.1 10.324 15.204H11.836C11.836 16.212 12.46 16.788 13.396 16.788C14.356 16.788 14.992 16.164 14.992 15.192C14.992 14.304 14.416 13.656 13.192 13.656Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_178_41572">
            <rect width="26" height="26" fill="white" />
          </clipPath>
        </defs>
      </>
    ),
    displayName: 'ThirdPlaceIcon',
  });
};
