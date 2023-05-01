import { Typography, Button, Logo } from '@webb-tools/webb-ui-components';

export const WebbLogoSection = () => {
  return (
    <section className="w-full px-4 md:px-0 py-[64px] md:py-[156px] bg-no-repeat bg-[50%_20%] bg-cover">
      <div className="space-y-9">
        <Typography variant="mkt-h2" className="text-center text-mono-200">
          The Webb Logo
        </Typography>

        <Typography
          variant="mkt-body"
          className="text-center text-mono-140 md:w-[70%] mx-auto"
        >
          The Webb logo embodies the spirit of decentralization and should be
          used consistently across all Webb-related communications to ensure
          visibility and recognition.
        </Typography>

        <div
          className="w-fit mx-auto p-4 flex flex-col md:flex-row gap-9 justify-center"
          style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
        >
          <div className="bg-mono-20 rounded-lg flex items-center justify-center py-6 px-20">
            <Logo size="lg" />
          </div>
          <div className="bg-mono-200 rounded-lg flex items-center justify-center py-6 px-20">
            <Logo size="lg" darkMode />
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
