import { createIcon } from '@webb-tools/icons/create-icon';
import React, { useMemo } from 'react';

import { LogoWithoutNameProps } from './types';

const defaultLogoSize = {
  width: 96,
  height: 29,
  viewBox: '0 0 96 29',
};

/**
 *
 * The Webb Logo without name component
 *
 * Props:
 *
 * - `size`: The logo size (default `md`)
 * - `darkMode`: Control logo dark mode using `js`, leave it's empty to control using `css`
 *
 * @example
 *
 * ```jsx
 *  <Logo size="lg" />
 *  <Logo darkMode={true} />
 * ```
 */
export const LogoWithoutName: React.FC<LogoWithoutNameProps> = (props) => {
  const { darkMode, size = 'md', ...restProps } = props;

  const { height, width } = useMemo(() => {
    switch (size) {
      case 'sm': {
        return {
          width: defaultLogoSize.width * 0.5,
          height: defaultLogoSize.height * 0.5,
        };
      }

      case 'md': {
        return {
          width: defaultLogoSize.width,
          height: defaultLogoSize.height,
        };
      }

      case 'lg': {
        return {
          width: defaultLogoSize.width * 1.5,
          height: defaultLogoSize.height * 1.5,
        };
      }

      default: {
        console.error('Logo size is not supported');

        return {
          width: defaultLogoSize.width,
          height: defaultLogoSize.height,
        };
      }
    }
  }, [size]);

  return createIcon({
    ...restProps,
    darkMode,
    path: [
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0294 13.476V15.0736C12.0294 16.143 12.9052 17.0195 13.9764 17.0195H15.5734C16.6438 17.0195 17.5196 16.143 17.5196 15.0736V13.476C17.5196 12.4058 16.6438 11.5293 15.5734 11.5293H13.9764C12.9052 11.5293 12.0294 12.4058 12.0294 13.476Z"
        fill="#B5A9F2"
      />,
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0294 8.5098C12.0294 10.073 10.8002 11.3436 9.28614 11.3436C7.77286 11.3436 6.54368 12.6133 6.54368 14.1858C6.54368 15.749 5.31369 17.0196 3.79146 17.0196C2.27819 17.0196 1.04901 15.749 1.04901 14.1858C1.04901 12.6133 2.27819 11.3436 3.79146 11.3436C5.31369 11.3436 6.54368 10.073 6.54368 8.5098C6.54368 6.94575 5.31369 5.676 3.79146 5.676H2.99372C1.92734 5.676 1.04901 4.76784 1.04901 3.66628V2.00973C1.04901 0.908161 1.92734 0 2.99372 0H4.59735C5.66454 0 6.54368 0.908161 6.54368 2.00973V2.84221C6.54368 4.40626 7.77286 5.676 9.28614 5.676C10.8002 5.676 12.0294 6.94575 12.0294 8.5098Z"
        fill="#DD4800"
      />,
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5196 24.4516V26.0552C17.5196 27.1216 16.6114 27.9999 15.5098 27.9999H13.854C12.7515 27.9999 11.8433 27.1216 11.8433 26.0552V25.2575C11.8433 23.7352 10.5735 22.5052 9.00938 22.5052C7.44609 22.5052 6.17629 23.7352 6.17629 25.2575C6.17629 26.7716 4.90564 27.9999 3.3331 27.9999C1.76981 27.9999 0.5 26.7716 0.5 25.2575C0.5 23.7352 1.76981 22.5052 3.3331 22.5052C4.90564 22.5052 6.17629 21.2769 6.17629 19.7628V18.9651C6.17629 17.8897 7.07524 17.0195 8.18527 17.0195H9.8335C10.9444 17.0195 11.8433 17.8897 11.8433 18.9651V19.7628C11.8433 21.2769 13.114 22.5052 14.6773 22.5052H15.5098C16.6114 22.5052 17.5196 23.3844 17.5196 24.4516Z"
        fill="#007D0D"
      />,
      <mask
        id="mask0_5554_12502"
        // style="mask-type:alpha"
        maskUnits="userSpaceOnUse"
        x="17"
        y="10"
        width="12"
        height="18"
      >
        <path d="M17.5196 10.9805H28.5V28.0001H17.5196V10.9805Z" fill="white" />
      </mask>,
      <g mask="url(#mask0_5554_12502)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.5002 25.167C28.5002 26.7303 27.2711 28.0001 25.749 28.0001C24.235 28.0001 23.0058 26.7303 23.0058 25.167C23.0058 23.5944 21.7767 22.3238 20.2627 22.3238H19.4642C18.3906 22.3238 17.5196 21.4248 17.5196 20.314V18.6666C17.5196 17.5557 18.3906 16.6568 19.4642 16.6568H20.2627C21.7767 16.6568 23.0058 15.3861 23.0058 13.8228C23.0058 12.2503 24.235 10.9805 25.749 10.9805C27.2711 10.9805 28.5002 12.2503 28.5002 13.8228C28.5002 15.3861 27.2711 16.6568 25.749 16.6568C24.235 16.6568 23.0058 17.9266 23.0058 19.4907C23.0058 21.054 24.235 22.3238 25.749 22.3238C27.2711 22.3238 28.5002 23.5944 28.5002 25.167Z"
          fill="#67A0EE"
        />
      </g>,
      <mask
        id="mask1_5554_12502"
        // style="mask-type:alpha"
        maskUnits="userSpaceOnUse"
        x="11"
        y="0"
        width="18"
        height="11"
      >
        <path d="M11.4804 0H28.5V10.9804H11.4804V0Z" fill="white" />
      </mask>,
      <g mask="url(#mask1_5554_12502)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.5003 1.94528V3.54952C28.5003 4.61494 27.5921 5.49398 26.4897 5.49398H25.658C24.0939 5.49398 22.8242 6.723 22.8242 8.2369C22.8242 9.7508 21.5544 10.9806 19.9903 10.9806C18.4263 10.9806 17.1565 9.7508 17.1565 8.2369C17.1565 6.723 15.8867 5.49398 14.3142 5.49398H13.4893C12.3886 5.49398 11.4804 4.61494 11.4804 3.54952V1.94528C11.4804 0.879037 12.3886 0 13.4893 0H15.1467C16.2483 0 17.1565 0.879037 17.1565 1.94528V2.75106C17.1565 4.26577 18.4263 5.49398 19.9903 5.49398C21.5544 5.49398 22.8242 4.26577 22.8242 2.75106V1.94528C22.8242 0.879037 23.7324 0 24.8339 0H26.4897C27.5921 0 28.5003 0.879037 28.5003 1.94528Z"
          fill="#F4C328"
        />
      </g>,
    ],
    displayName: 'WebbLogoWithoutName',
    defaultProps: {
      width,
      height,
      fill: 'none',
      stroke: 'none',
    },
    viewBox: defaultLogoSize.viewBox,
  });
};
