import { NextSeo } from 'next-seo';

import { BrandKitHeroSection, WebbLogoSection } from '../components';

const BrandKit = () => {
  return (
    <>
      <NextSeo title="Brand Kit" />

      <BrandKitHeroSection />

      <WebbLogoSection />
    </>
  );
};

export default BrandKit;
