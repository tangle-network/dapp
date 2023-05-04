import { NextSeo } from 'next-seo';

import {
  BrandKitHeroSection,
  WebbLogoSection,
  ColorPalettesSection,
} from '../components';

const BrandKit = () => {
  return (
    <>
      <NextSeo title="Brand Kit" />

      <BrandKitHeroSection />

      <WebbLogoSection />

      <ColorPalettesSection />
    </>
  );
};

export default BrandKit;
