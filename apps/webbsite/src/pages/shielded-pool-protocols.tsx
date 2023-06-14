import {
  ShieldedPoolHeroSection,
  ShieldedPoolUseCasesSection,
  HowShieldedPoolWorksSection,
  ShieldedPoolExtensionsSection,
} from '../components/shielded-pool';

const ShieldedPoolProtocolsPage = () => {
  return (
    <div className="bg-mono-20">
      <ShieldedPoolHeroSection />
      <ShieldedPoolUseCasesSection />
      <HowShieldedPoolWorksSection />
      <ShieldedPoolExtensionsSection />
    </div>
  );
};

export default ShieldedPoolProtocolsPage;
