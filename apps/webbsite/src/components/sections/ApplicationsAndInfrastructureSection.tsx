import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';
import Image from 'next/image';

import { BRIDGE_URL, STATS_URL } from '../../constants';
import Heading2 from '../Heading2';
import Heading3 from '../Heading3';
import SubHeading from '../SubHeading';
import SubHeading2 from '../SubHeading2';

const identityProtocolUrl = 'https://webb.tools';

const ApplicationsAndInfrastructureSection = () => {
  return (
    <section className="p-[156px] space-y-6">
      <div className="pb-9 space-y-9 max-w-[900px] mx-auto">
        <Heading2 className="text-center">
          Applications & Infrastructure
        </Heading2>
        <SubHeading className="text-center">
          Webb Builds private cross-chain applications and infrastructure that
          enable web3 privacy ecosystems to scale
        </SubHeading>
      </div>

      <div className="space-y-[72px]">
        <div className="max-w-[900px] relative bg-tangle_network h-[471px] mx-auto space-y-[72px] rounded-lg">
          <div className="absolute top-0 left-0 space-y-4 p-9 max-w-[441px]">
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

        <div className="flex space-x-6 max-w-[900px] mx-auto">
          <div className="h-[401px] w-1/2 relative">
            <Image
              src="/static/assets/good-pink.png"
              alt="good-pink"
              fill
              sizes="(max-width: 438px)"
            />
          </div>

          <div className="max-w-[369px] my-auto">
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

        <div className="flex space-x-6 max-w-[900px] mx-auto">
          <div className="max-w-[369px] my-auto">
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

          <div className="h-[401px] w-1/2 relative">
            <Image
              src="/static/assets/cool.png"
              sizes="(max-width: 438px)"
              alt="cool"
              fill
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplicationsAndInfrastructureSection;
