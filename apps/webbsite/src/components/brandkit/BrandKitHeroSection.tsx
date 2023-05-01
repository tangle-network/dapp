import { Typography } from '@webb-tools/webb-ui-components';

export const BrandKitHeroSection = () => {
  return (
    <section className="md:h-[430px] w-full px-4 py-[96px] md:py-[150px] bg-brandkit_hero bg-no-repeat bg-[50%_20%] bg-cover">
      <div className="space-y-6 md:space-y-8">
        <Typography variant="mkt-h2" className="text-center text-mono-200">
          Webb Brand Kit
        </Typography>

        <Typography
          variant="mkt-body"
          className="text-center text-mono-140 md:w-[70%] mx-auto"
        >
          {
            "In the spirit of scaling blockchain privacy, all aspects of Webb belong to the community. including Webb's logo and brand itself."
          }
        </Typography>
      </div>
    </section>
  );
};
