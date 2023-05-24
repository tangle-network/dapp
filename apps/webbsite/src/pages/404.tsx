import { Button, Typography } from '@webb-tools/webb-ui-components';

const NotFoundPage = () => {
  return (
    <>
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
            It looks like this page doesn&apos;t exist.
          </Typography>
          <div className="flex gap-4">
            <Button
              href="/"
              className="!text-[12px] !leading-[18px] md:!text-[16px] md:!leading-[24px]"
            >
              Take Me Home
            </Button>
            <Button
              variant="secondary"
              href="/blog"
              className="!text-[12px] !leading-[18px] md:!text-[16px] md:!leading-[24px]"
            >
              Explore the Blog
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
