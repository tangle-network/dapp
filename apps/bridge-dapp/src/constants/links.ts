import populateDocsUrl from '@webb-tools/webb-ui-components/utils/populateDocsUrl';
import { WEBB_DOC_ROUTES_RECORD } from '.';

export const NOTE_ACCOUNT_DOCS_URL = populateDocsUrl(
  WEBB_DOC_ROUTES_RECORD.projects['hubble-bridge']['usage-guide'].account,
);

export const USAGE_GUIDE_PATH = '/docs/projects/hubble-bridge/usage-guide';

export const BRIDGE_OVERVIEW_PATH = '/docs/projects/hubble-bridge/overview';

export const RECIPIENT_PUBLIC_KEY_DOCS_URL = populateDocsUrl(
  WEBB_DOC_ROUTES_RECORD.projects['hubble-bridge']['usage-guide'].transfer[
    '#6-input-recipient-shielded-address'
  ],
);
