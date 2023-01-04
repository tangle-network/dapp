import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';

import cx from 'classnames';
import Image from 'next/image';

import { BRIDGE_URL, STATS_URL } from '../../constants';
import Heading2 from '../Heading2';
import Heading3 from '../Heading3';
import SubHeading from '../SubHeading';
import SubHeading2 from '../SubHeading2';

const identityProtocolUrl = 'https://webb.tools';

const ApplicationsAndInfrastructureSection = () => {
  return (
    <section className="py-16 md:py-[156px] space-y-6">
      <div className="pb-9 space-y-9 px-4 max-w-[900px] mx-auto">
        <Heading2 className="text-center">
          Applications & Infrastructure
        </Heading2>
        <SubHeading className="text-center">
          Webb Builds private cross-chain applications and infrastructure that
          enable web3 privacy ecosystems to scale
        </SubHeading>
      </div>

      <div className="px-4 space-y-[72px]">
        <div className="flex flex-col-reverse md:flex-row md:justify-between max-w-[900px] mx-auto">
          <div className="mt-6 md:w-[calc(50%-12.5px)] md:my-auto">
            <Heading3>Tangle Network</Heading3>
            <SubHeading2 className="mt-2">
              Cross-chain private applications require governance and trustless
              proof of events. Tangle provides that using threshold multi-party
              computation.
            </SubHeading2>

            <Button
              className="mt-6"
              href={BRIDGE_URL}
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
            <Heading3>Connected Shielded Pool Protocols</Heading3>
            <SubHeading2 className="mt-2">
              A cross-chain private transaction system for privately moving and
              privately transferring assets between blockchains.
            </SubHeading2>
            <Button
              href={STATS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row md:justify-between max-w-[900px] mx-auto">
          <div className="mt-6 md:w-[calc(50%-12.5px)] md:my-auto">
            <Heading3>Connected Shielded Identity Protocols</Heading3>
            <SubHeading2 className="mt-2">
              A cross-chain system for creating identities and connecting groups
              between blockchains.
            </SubHeading2>
            <Button
              href={identityProtocolUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6"
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

export default ApplicationsAndInfrastructureSection;
