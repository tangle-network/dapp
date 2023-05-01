import { NextSeo } from 'next-seo';

import { BrandKitHeroSection } from '../components';

const BrandKit = () => {
  return (
    <>
      <NextSeo title="Brand Kit" />

      <BrandKitHeroSection />
    </>
  );
};

export default BrandKit;
