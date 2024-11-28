import { Metadata } from 'next';

import BridgeContainer from '../../containers/bridge/BridgeContainer';
import createPageMetadata from '../../utils/createPageMetadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Bridge',
});

export default function BridgePage() {
  return <BridgeContainer />;
}
