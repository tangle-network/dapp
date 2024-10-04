import {
  CoinsLineIcon,
  EyeLineIcon,
  Search,
  SparklingIcon,
} from '@webb-tools/icons';
import {
  TANGLE_DOCS_STAKING_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import { Metadata } from 'next';

import OnboardingItem from '../../components/OnboardingModal/OnboardingItem';
import OnboardingModal from '../../components/OnboardingModal/OnboardingModal';
import { OnboardingPageKey } from '../../constants';
import { OpenGraphPageImageUrl } from '../../constants/openGraph';
import {
  HeaderChipsContainer,
  KeyStatsContainer,
  NominationsPayoutsContainer,
  NominatorStatsContainer,
  ValidatorTablesContainer,
} from '../../containers';
import createPageMetadata from '../../utils/createPageMetadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Nomination',
  imageUrl: OpenGraphPageImageUrl.Nomination,
  description:
    'Elevate your TNT tokens through NPoS by nominating validators on Tangle Network. Stake on EVM and Substrate to support network security and enjoy rewards.',
});

export default async function NominationPage() {
  return (
    <>
      <OnboardingModal
        title="Get Started Nominating Validators"
        learnMoreHref={TANGLE_DOCS_STAKING_URL}
        pageKey={OnboardingPageKey.NOMINATE}
      >
        <OnboardingItem
          Icon={EyeLineIcon}
          title="Staking Stats at a Glance"
          description="View key stats like the ideal vs. actual staked assets, inflation, and active/nominated validators to get a quick overview of the network."
        />

        <OnboardingItem
          Icon={Search}
          title="Discover & Nominate Validators"
          description="Explore active & waiting validators that help secure the network and choose those that align with your values to nominate them by delegating your TNT tokens."
        />

        <OnboardingItem
          Icon={SparklingIcon}
          title="Get Rewarded Without Running a Node"
          description="Earn rewards for nominating validators at the end of each staking era—all without the complexity and costs of running a node yourself."
        />

        <OnboardingItem
          Icon={CoinsLineIcon}
          title="Request Payouts from Past Eras"
          description="Claim your rewards by manually requesting payouts from your validators from past eras."
        />
      </OnboardingModal>

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
}
