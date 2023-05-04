import { Typography, Button } from '@webb-tools/webb-ui-components';

export const TypographySection = () => {
  return (
    <section className="dark bg-mono-200 w-full px-4 py-[96px] md:py-[150px]">
      <div className="max-w-[1440px] mx-auto space-y-6 md:space-y-8">
        <Typography variant="mkt-h2" className="text-center !text-mono-0">
          Typography
        </Typography>

        <Typography
          variant="mkt-body"
          className="text-center text-mono-140 md:max-w-[900px] mx-auto"
        >
          Satoshi Variable is the primary typeface used for Webb’s online and
          marketing communications, offering a modern and versatile style.
          Breeze Sans is used for Webb Ecosystem products, providing a clean and
          polished look. Both typefaces are open-source and accessible to
          everyone in the community.
        </Typography>

        <div className="mx-auto md:max-w-[1200px] lg:px-4 flex flex-col md:flex-row gap-6">
          <div className="min-h-[150px] md:h-[200px] flex-[1] bg-mono-190 flex items-center justify-center rounded-lg">
            <Typography variant="mkt-h3" className="!text-mono-0">
              Satoshi Variable
            </Typography>
          </div>
          <div className="min-h-[150px] md:h-[200px] flex-[1] bg-mono-190 flex items-center justify-center rounded-lg">
            <Typography variant="mkt-h3" className="!text-mono-0">
              Breeze Sans
            </Typography>
          </div>
        </div>

        <Button
          href="#"
          target="_blank"
          rel="noreferrer"
          className="block mx-auto button-base button-primary"
        >
          Download
        </Button>
      </div>
    </section>
  );
};
