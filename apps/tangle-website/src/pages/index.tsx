import {
  HeroSection,
  IntroducingSection,
  GovernanceSystemSection,
  FeaturesSection,
} from '../components';

export function Index() {
  return (
    <div className="bg-body bg-top">
      <HeroSection />

      <IntroducingSection />

      <FeaturesSection />

      <GovernanceSystemSection />
    </div>
  );
}

export default Index;
