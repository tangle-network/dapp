import { createIcon } from './create-icon';
import { IconBase } from './types';

const FolderOpenFill = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M2.10417 14C1.73598 14 1.4375 13.7015 1.4375 13.3333V2.66667C1.4375 2.29848 1.73598 2 2.10417 2H7.04697L8.3803 3.33333H13.4375C13.8057 3.33333 14.1042 3.63181 14.1042 4V6H2.77083V12.664L4.10417 7.33333H15.1042L13.5638 13.495C13.4896 13.7918 13.2229 14 12.917 14H2.10417Z',
    displayName: 'FolderOpenFill',
  });
};

export default FolderOpenFill;
