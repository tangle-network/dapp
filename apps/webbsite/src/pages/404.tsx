import { Button, Typography } from '@webb-tools/webb-ui-components';

const DISCORD_LINK = 'https://discord.com/invite/cv8EfJu3Tn';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-not_found_mobile md:bg-not_found bg-[15%_0%] lg:bg-center md:bg-cover">
      <div className="flex flex-col gap-6 px-4 md:px-0">
        <Typography
          variant="mkt-h1"
          className="text-center text-mono-200 font-black !text-[86px] !leading-[72px]"
        >
          404
        </Typography>
        <Typography
          variant="mkt-subheading"
          className="text-center text-mono-140 font-medium"
        >
          Lost in Cosmic Privacy? We&apos;re Retrieving Your Page.
        </Typography>
        <div className="flex gap-4 justify-center">
          <Button href="/" className="button-base button-primary">
            Take Me Home
          </Button>
          <Button
            variant="secondary"
            href={DISCORD_LINK}
            target="_blank"
            rel="noreferrer"
            className="button-base button-secondary"
          >
            Get Help
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
