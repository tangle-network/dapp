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
} from '../components';

export function Index() {
  return (
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

        <CommunitySection />
      </div>
    </div>
  );
}

export default Index;
