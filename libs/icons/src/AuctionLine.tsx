import { createIcon } from './create-icon';
import { IconBase } from './types';

export const AuctionLine = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M14 20V22H2V20H14ZM14.586 0.686035L22.364 8.46404L20.95 9.88004L19.89 9.52604L17.413 12L23.07 17.657L21.656 19.071L16 13.414L13.596 15.818L13.879 16.95L12.464 18.364L4.686 10.586L6.101 9.17204L7.231 9.45404L13.525 3.16104L13.172 2.10104L14.586 0.686035ZM15.293 4.22204L8.222 11.292L11.757 14.828L18.828 7.75804L15.293 4.22204Z',
    displayName: 'AuctionLine',
  });
};
