import {
  HeroSection,
  IntroducingSection,
  GovernanceSystemSection,
  FeaturesSection,
  ParticipationMechanicsSection,
} from '../components';

export function Index() {
  return (
    <div className="bg-body bg-top">
      <HeroSection />

      <IntroducingSection />

      <FeaturesSection />

      <GovernanceSystemSection />

      <ParticipationMechanicsSection />
    </div>
  );
}

export default Index;
