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

export function Index() {
  return (
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
  );
}

export default Index;
