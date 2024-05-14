import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

export const TwitterFill = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 32 32',
    path: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.2385 17.2976L1 3H9.90168L16.8391 11.8369L24.2507 3.03979H29.1532L19.2095 14.8563L31 29.875H22.1249L14.6131 20.3185L6.59345 29.8485H1.6643L12.2385 17.2976ZM23.4185 27.2259L6.45821 5.64909H8.60707L25.546 27.2259H23.4185Z"
      />
    ),
    displayName: 'TwitterFill',
  });
};
