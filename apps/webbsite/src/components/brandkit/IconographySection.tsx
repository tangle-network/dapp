import { Typography, Button } from '@webb-tools/webb-ui-components';

export const IconographySection = () => {
  return (
    <section className="w-full px-4 md:px-0 py-[64px] md:py-[156px] bg-no-repeat bg-[50%_20%] bg-cover">
      <div className="max-w-[1440px] mx-auto space-y-9">
        <Typography variant="mkt-h2" className="text-center text-mono-200">
          Iconography
        </Typography>

        <Typography
          variant="mkt-body"
          className="text-center text-mono-140 md:max-w-[900px] mx-auto"
        >
          Remix Icons is a popular, open-source icon library that offers a wide
          range of modern and versatile icons for web and mobile interfaces.
        </Typography>

        <div className="lg:max-w-[900px] md:w-full md:px-4 lg:px-0 md:mx-auto">
          <div className="w-full h-[192px] bg-contain bg-no-repeat bg-center bg-brandkit_iconography_mobile md:bg-brandkit_iconography_desktop" />
        </div>

        <Button
          href="https://github.com/Remix-Design/RemixIcon"
          target="_blank"
          rel="noreferrer"
          className="block mx-auto button-base button-primary"
        >
          View Github
        </Button>
      </div>
    </section>
  );
};
