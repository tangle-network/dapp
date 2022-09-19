import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Close = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M13.6281 10.586L19.2499 5.63599L20.8558 7.04999L15.234 12L20.8558 16.95L19.2499 18.364L13.6281 13.414L8.00629 18.364L6.40039 16.95L12.0222 12L6.40039 7.04999L8.00629 5.63599L13.6281 10.586Z'
      />
    ),
    displayName: 'Close',
  });
};
