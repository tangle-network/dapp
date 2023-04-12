import {
  HeroSection,
  IntroducingSection,
  GovernanceSystemSection,
} from '../components';

export function Index() {
  return (
    <div className="bg-body bg-top">
      <HeroSection />

      <IntroducingSection />

      <GovernanceSystemSection />
    </div>
  );
}

export default Index;
