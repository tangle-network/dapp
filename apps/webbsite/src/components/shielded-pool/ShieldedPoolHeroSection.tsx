import cx from 'classnames';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import {
  SOCIAL_URLS_RECORD,
  WEBB_DOC_ROUTES_RECORD,
} from '@webb-tools/webb-ui-components/constants';
import populateDocsUrl from '@webb-tools/webb-ui-components/utils/populateDocsUrl';

export const ShieldedPoolHeroSection = () => {
  return (
    <section
      className={cx(
        'w-full py-[175px]',
        'bg-shielded_pool_hero bg-center bg-cover',
        'flex justify-center items-center'
      )}
    >
      <div className="flex flex-col items-center gap-6 px-4 m-auto md:px-0 md:gap-9">
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
            href={SOCIAL_URLS_RECORD.github}
            target="_blank"
            rel="noreferrer"
            className="button-base button-primary"
          >
            Source Code
          </Button>
          <Button
            variant="secondary"
            href={populateDocsUrl(
              WEBB_DOC_ROUTES_RECORD.protocols['single-asset-shielded-pool']
                .overview
            )}
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
