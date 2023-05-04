import { NextSeo } from 'next-seo';

import {
  BrandKitHeroSection,
  WebbLogoSection,
  ColorPalettesSection,
  IconographySection,
  TypographySection,
  PressInquiriesSection,
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

      <PressInquiriesSection />
    </>
  );
};

export default BrandKit;
