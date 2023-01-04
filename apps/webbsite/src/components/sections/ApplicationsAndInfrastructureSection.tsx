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
        <div>
          <div className="max-w-[900px] relative bg-tangle_network bg-right md:bg-left h-[471px] mx-auto space-y-[72px] rounded-lg">
            <div className="absolute top-0 left-0 space-y-4 p-9 max-w-[441px] hidden md:block">
              <Heading3>Tangle Network</Heading3>
              <SubHeading2>
                Cross-chain private applications require governance and
                trustless proof of events. Tangle provides that using threshold
                multi-party computation.
              </SubHeading2>

              <Button href={BRIDGE_URL} target="_blank" rel="noreferrer">
                Learn More
              </Button>
            </div>
          </div>

          <div className="block mt-6 space-y-4 md:hidden">
            <Heading3>Tangle Network</Heading3>
            <SubHeading2>
              Cross-chain private applications require governance and trustless
              proof of events. Tangle provides that using threshold multi-party
              computation.
            </SubHeading2>

            <Button href={BRIDGE_URL} target="_blank" rel="noreferrer">
              Learn More
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-6 max-w-[900px] mx-auto">
          <div
            className={cx(
              'sm:min-w-[450px] min-h-[401px] grow-0 shrink-0',
              'bg-good_pink bg-center object-fill bg-no-repeat bg-cover rounded-lg'
            )}
          />

          <div className="my-auto shrink">
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

        <div className="flex flex-col-reverse md:flex-row md:space-x-6 max-w-[900px] mx-auto">
          <div className="my-auto mt-6 shrink md:mt-0">
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
              'sm:min-w-[450px] min-h-[401px] grow-0 shrink-0',
              'bg-cool bg-center object-fill bg-no-repeat bg-cover rounded-lg'
            )}
          />
        </div>
      </div>
    </section>
  );
};

export default ApplicationsAndInfrastructureSection;
