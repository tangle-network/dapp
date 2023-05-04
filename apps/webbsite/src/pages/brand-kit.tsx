import { NextSeo } from 'next-seo';

import {
  BrandKitHeroSection,
  WebbLogoSection,
  ColorPalettesSection,
  IconographySection,
} from '../components';

const BrandKit = () => {
  return (
    <>
      <NextSeo title="Brand Kit" />

      <BrandKitHeroSection />

      <WebbLogoSection />

      <ColorPalettesSection />

      <IconographySection />
    </>
  );
};

export default BrandKit;
