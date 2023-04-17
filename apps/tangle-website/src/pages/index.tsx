import {
  CommunitySection,
  HeroSection,
  IntroducingSection,
  GovernanceSystemSection,
  FeaturesSection,
  UseCasesSection,
} from '../components';

export function Index() {
  return (
    <div className="bg-body bg-top">
      <HeroSection />

      <IntroducingSection />

      <FeaturesSection />

      <GovernanceSystemSection />

      <UseCasesSection />

      <CommunitySection />
    </div>
  );
}

export default Index;
