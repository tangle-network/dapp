import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';

export const HowShieldedPoolWorksSection = () => {
  return (
    <section className="dark bg-mono-200 py-[64px] md:py-[156px] px-4 lg:px-0">
      <div className="max-w-[900px] mx-auto">
        <Typography
          variant="mkt-h3"
          className={cx(
            'text-center !text-mono-0 font-black mb-6',
            '!text-[36px] !leading-[48px] md:!text-[48px] md:!leading-[60px]'
          )}
        >
          How Shielded Pool Works
        </Typography>
      </div>
    </section>
  );
};
