import { createIcon } from './create-icon';
import { IconBase } from './types';

export const LinkedInFill = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 32 32',
    path: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24.447 24.452h-3.554v-5.57c0-1.327-.026-3.037-1.853-3.037-1.852 0-2.135 1.446-2.135 2.94v5.667h-3.554V13h3.413v1.56h.047c.477-.899 1.637-1.85 3.37-1.85 3.6 0 4.267 2.371 4.267 5.455v6.287h-.001zM9.337 11.433a2.06 2.06 0 01-2.064-2.065 2.064 2.064 0 112.063 2.065h.001zm1.782 13.019H7.555V13h3.565v11.452h-.001zM26.227 4H5.772C4.791 4 4 4.773 4 5.73v20.54c0 .957.792 1.73 1.77 1.73h20.451C27.2 28 28 27.227 28 26.27V5.73C28 4.772 27.2 4 26.221 4h.006z"
      />
    ),
    displayName: 'LinkedInFill',
  });
};
