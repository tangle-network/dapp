import { NextSeo } from 'next-seo';
import {
  CommunitySection,
  HeroSection,
  IntroducingSection,
  GovernanceSystemSection,
  FeaturesSection,
  ParticipationMechanicsSection,
  LaunchPhasesSection,
  SupportedBySection,
  UseCasesSection,
  FAQSection,
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

      <div className="bg-body bg-top block">
        <div className="mx-auto">
          <HeroSection />

          <IntroducingSection />

          <FeaturesSection />

          <GovernanceSystemSection />

          <ParticipationMechanicsSection />

          <LaunchPhasesSection />

          <UseCasesSection />

          <SupportedBySection />

          <FAQSection />

          <CommunitySection />
        </div>
      </div>
    </>
  );
}

export default Index;
