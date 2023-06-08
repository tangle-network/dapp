import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';

import { ShieldedPoolSwiper } from '../../components';

export const HowShieldedPoolWorksSection = () => {
  return (
    <section className="dark bg-mono-200 py-[64px] md:py-[156px]">
      <div className="max-w-[1000px] mx-auto">
        <Typography
          variant="mkt-h3"
          className={cx(
            'text-center !text-mono-0 font-black mb-9',
            '!text-[36px] !leading-[48px] md:!text-[48px] md:!leading-[60px]'
          )}
        >
          How Shielded Pool Works
        </Typography>

        <ShieldedPoolSwiper />
      </div>
    </section>
  );
};
