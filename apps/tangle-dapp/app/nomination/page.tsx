import { Typography } from '@webb-tools/webb-ui-components';
import { Metadata } from 'next';

import { OpenGraphPageImageUrl } from '../../constants/openGraph';
import {
  HeaderChipsContainer,
  KeyStatsContainer,
  NominationsPayoutsContainer,
  NominatorStatsContainer,
  ValidatorTablesContainer,
} from '../../containers';
import createPageMetadata from '../../utils/createPageMetadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Nomination',
  imageUrl: OpenGraphPageImageUrl.Nomination,
  description:
    'Elevate your TNT tokens through NPoS by nominating validators on Tangle Network. Stake on EVM and Substrate to support network security and enjoy rewards.',
});

// Note: already tried using Suspense here but see no improvement
export default async function NominationPage() {
  return (
    <div className="space-y-6 md:space-y-9 lg:space-y-12">
      <div className="flex items-center justify-between">
        <Typography variant="h4" fw="bold">
          Overview
        </Typography>

        <HeaderChipsContainer />
      </div>

      <KeyStatsContainer />

      <NominatorStatsContainer />

      <NominationsPayoutsContainer />

      <ValidatorTablesContainer />
    </div>
  );
}
