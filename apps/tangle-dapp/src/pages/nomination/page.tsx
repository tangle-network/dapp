import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { OpenGraphPageImageUrl } from '../../constants/openGraph';
import {
  HeaderChipsContainer,
  KeyStatsContainer,
  NominationsPayoutsContainer,
  NominatorStatsContainer,
  ValidatorTablesContainer,
} from '../../containers';

const pageConfig = {
  title: 'Nomination',
  metadata: {
    title: 'Nomination | Tangle Network',
    description:
      'Elevate your TNT tokens through NPoS by nominating validators on Tangle Network. Stake on EVM and Substrate to support network security and enjoy rewards.',
    openGraph: {
      title: 'Nomination | Tangle Network',
      description:
        'Elevate your TNT tokens through NPoS by nominating validators on Tangle Network. Stake on EVM and Substrate to support network security and enjoy rewards.',
      images: [{ url: OpenGraphPageImageUrl.Nomination }],
    },
  },
};

const NominationPage: FC = () => {
  return (
    <>
      <Helmet>
        <title>{pageConfig.metadata.title}</title>
        <meta name="description" content={pageConfig.metadata.description} />
        <meta
          property="og:title"
          content={pageConfig.metadata.openGraph.title}
        />
        <meta
          property="og:description"
          content={pageConfig.metadata.openGraph.description}
        />
        <meta property="og:image" content={OpenGraphPageImageUrl.Nomination} />
      </Helmet>

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
    </>
  );
};

export default NominationPage;
