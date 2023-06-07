import cx from 'classnames';
import { Button, Typography } from '@webb-tools/webb-ui-components';

export const ShieldedPoolHeroSection = () => {
  return (
    <section
      className={cx(
        'w-full py-[175px]',
        'bg-shielded_pool_hero bg-center bg-cover',
        'flex justify-center items-center'
      )}
    >
      <div className="m-auto px-4 md:px-0 flex flex-col items-center gap-6 md:gap-9">
        <Typography
          variant="mkt-h3"
          className={cx(
            'text-center text-mono-200 font-black',
            '!text-[36px] !leading-[48px] md:!text-[48px] md:!leading-[60px]'
          )}
        >
          Shielded Pool Protocols
        </Typography>
        <div className="flex gap-2">
          <Button
            // TODO: update href
            href="#"
            className="button-base button-primary"
          >
            Source Code
          </Button>
          <Button
            variant="secondary"
            // TODO: update href
            href="#"
            target="_blank"
            rel="noreferrer"
            className="button-base button-secondary"
          >
            Documentation
          </Button>
        </div>
      </div>
    </section>
  );
};
