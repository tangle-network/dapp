import { Button, Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import {
  CONNECTED_SHIELDED_IDENTITY_URL,
  CONNECTED_SHIELDED_POOLS_URL,
  TANGLE_NETWORK_URL,
} from '../../constants';
export const ApplicationsAndInfrastructureSection = () => {
  return (
    <section className="py-16 md:py-[156px] space-y-6">
      <div className="pb-9 space-y-9 px-4 max-w-[900px] mx-auto">
        <Typography variant="mkt-h2" className="text-center">
          Applications & Infrastructure
        </Typography>
        <Typography
          variant="mkt-body"
          className="text-center text-mono-180 md:px-24"
        >
          Webb Builds private cross-chain applications and infrastructure that
          enable web3 privacy ecosystems to scale
        </Typography>
      </div>

      <div className="px-4 space-y-[72px]">
        <div className="flex flex-col-reverse md:flex-row md:justify-between max-w-[900px] mx-auto">
          <div className="mt-6 md:w-[calc(50%-12.5px)] md:my-auto">
            <Typography variant="mkt-h3" className="text-mono-200">
              Tangle Network
            </Typography>
            <Typography variant="mkt-caption" className="mt-2 text-mono-180">
              Cross-chain private applications require governance and trustless
              proof of events. Tangle provides that using threshold multi-party
              computation.
            </Typography>

            <Button
              className="mt-6 button-base button-primary"
              href={TANGLE_NETWORK_URL}
              target="_blank"
              rel="noreferrer"
            >
              Learn More
            </Button>
          </div>

          <div
            className={cx(
              'sm:min-w-[calc(50%-12.5px)] min-h-[401px] grow-0 shrink-0',
              'bg-tangle_network bg-center object-fill bg-no-repeat bg-cover rounded-lg'
            )}
          />
        </div>

        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:justify-between max-w-[900px] mx-auto">
          <div
            className={cx(
              'sm:min-w-[calc(50%-12.5px)] min-h-[401px] grow-0 shrink-0',
              'bg-good_pink bg-center object-fill bg-no-repeat bg-cover rounded-lg'
            )}
          />

          <div className="self-start md:w-[calc(50%-12.5px)] md:!my-auto">
            <Typography variant="mkt-h3" className="text-mono-200">
              Connected Shielded Pool Protocols
            </Typography>
            <Typography variant="mkt-caption" className="mt-2 text-mono-180">
              A cross-chain private transaction system for privately moving and
              privately transferring assets between blockchains.
            </Typography>
            <Button
              href={CONNECTED_SHIELDED_POOLS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 button-base button-primary"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row md:justify-between max-w-[900px] mx-auto">
          <div className="mt-6 md:w-[calc(50%-12.5px)] md:my-auto">
            <Typography variant="mkt-h3" className="text-mono-200">
              Connected Shielded Identity Protocols
            </Typography>
            <Typography variant="mkt-caption" className="mt-2 text-mono-180">
              A cross-chain system for creating identities and connecting groups
              between blockchains.
            </Typography>
            <Button
              href={CONNECTED_SHIELDED_IDENTITY_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 button-base button-primary"
            >
              Learn More
            </Button>
          </div>

          <div
            className={cx(
              'sm:min-w-[calc(50%-12.5px)] min-h-[401px] grow-0 shrink-0',
              'bg-cool bg-center object-fill bg-no-repeat bg-cover rounded-lg'
            )}
          />
        </div>
      </div>
    </section>
  );
};
