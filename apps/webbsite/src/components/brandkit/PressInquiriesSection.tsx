import { Typography, Button } from '@webb-tools/webb-ui-components';
import { ChainIcon } from '@webb-tools/icons';

export const PressInquiriesSection = () => {
  return (
    <section className="w-full px-4 lg:px-0 py-[64px] md:py-[156px] bg-no-repeat bg-[50%_20%] bg-cover">
      <div className="max-w-[1440px] mx-auto space-y-9">
        <ChainIcon name="webb" size="lg" className="mx-auto" />

        <Typography variant="mkt-h2" className="text-center text-mono-200">
          Press Inquiries
        </Typography>

        <Typography
          variant="mkt-body"
          className="text-center text-mono-140 md:max-w-[900px] mx-auto"
        >
          To make any use of our marks in a way not covered by these guidelines,
          please contact us and include a visual mockup of intended use. For
          press inquiries, please reach out to{' '}
          <span className="underline text-inherit">press@webb.tools</span>.
        </Typography>

        <Button
          href="mailto:press@webb.tools"
          target="_blank"
          rel="noreferrer"
          className="block mx-auto button-base button-primary"
        >
          Get in Touch
        </Button>
      </div>
    </section>
  );
};
