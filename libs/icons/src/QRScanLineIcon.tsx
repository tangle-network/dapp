import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

const QRScanLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M15 3h6v5h-2V5h-4V3zM9 3v2H5v3H3V3h6zm6 18v-2h4v-3h2v5h-6zm-6 0H3v-5h2v3h4v2zM3 11h18v2H3v-2z',
    displayName: 'QRScanLineIcon',
  });
};

export default QRScanLineIcon;
