import { Typography } from '@webb-tools/webb-ui-components';

export const BrandKitHeroSection = () => {
  return (
    <section className="md:h-[430px] w-full px-4 py-[96px] md:py-[150px] bg-brandkit_hero bg-no-repeat bg-[50%_60%] bg-cover">
      <div className="max-w-[1440px] mx-auto space-y-6 md:space-y-8">
        <Typography
          variant="mkt-h3"
          className="text-center text-mono-200 font-black"
        >
          Webb Brand Kit
        </Typography>

        <Typography
          variant="mkt-subheading"
          className="text-center text-mono-140 md:max-w-[900px] mx-auto font-medium"
        >
          {
            "In the spirit of scaling blockchain privacy, all aspects of Webb belong to the community. including Webb's logo and brand itself."
          }
        </Typography>
      </div>
    </section>
  );
};
