import { NextSeo } from 'next-seo';
import {
  CommunitySection,
  HeroSection,
  IntroducingSection,
  GovernanceSystemSection,
  FeaturesSection,
  ParticipationMechanicsSection,
  SupportedBySection,
  UseCasesSection,
} from '../components';

const description =
  'Webb builds infrastructure for connecting zero-knowledge applications empowering developers to unlock user privacy in the Web3 ecosystem.';

export function Index() {
  return (
    <>
      <NextSeo
        description={description}
        canonical="https://tangle.webb.tools/"
        openGraph={{
          title:
            'The next-generation TSS based blockchain powering cross-chain zero-knowledge messaging and applications',
          description,
          url: 'https://tangle.webb.tools/',
        }}
      />

      <div className="bg-body bg-top block max-w-[1440px] mx-auto">
        <HeroSection />

        <IntroducingSection />

        <FeaturesSection />

        <SupportedBySection />

        <GovernanceSystemSection />

        <ParticipationMechanicsSection />

        <UseCasesSection />

        <CommunitySection />
      </div>
    </>
  );
}

export default Index;
