import { NextSeo } from 'next-seo';

import {
  BrandKitHeroSection,
  WebbLogoSection,
  ColorPalettesSection,
  IconographySection,
  TypographySection,
} from '../components';

const BrandKit = () => {
  return (
    <>
      <NextSeo title="Brand Kit" />

      <BrandKitHeroSection />

      <WebbLogoSection />

      <ColorPalettesSection />

      <IconographySection />

      <TypographySection />
    </>
  );
};

export default BrandKit;
