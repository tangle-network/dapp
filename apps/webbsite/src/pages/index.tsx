import { ChainIcon } from '@webb-tools/icons';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
} from '@webb-tools/webb-ui-components';
import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';
import cx from 'classnames';
import Image from 'next/image';

import Heading2 from '../components/Heading2';
import Heading3 from '../components/Heading3';
import HeroSection from '../components/sections/HeroSection';
import InActionSection from '../components/sections/InActionSection';
import ResearchAndDevelopmentSection from '../components/sections/ResearchAndDevelopmentSection';
import SubHeading from '../components/SubHeading';
import SubHeading2 from '../components/SubHeading2';

export function Index() {
  return (
    <>
      <div className="relative object-cover bg-no-repeat bg-cover bg-hero_bg_image h-[2250px] bg-top">
        <HeroSection />

        <section className="max-w-[932px] flex flex-col justify-center absolute bottom-28 left-1/2 -translate-x-1/2 w-full">
          <ChainIcon name="tangle" className="mx-auto w-7 h-7" />
          <Heading2 className="text-[48px] leading-[72px] text-mono-200 font-bold text-center mt-6">
            The Future of privacy is Connected
          </Heading2>
          <SubHeading className="text-center mt-9">
            Connecting private applications across chains allows us to scale the
            size of privacy sets to encompass all the users and data possible in
            our Web3 ecosystem.
          </SubHeading>
          <TabsRoot
            defaultValue="ownership"
            className="p-4 space-y-4 rounded-lg mt-9 bg-mono-0"
          >
            <TabsList aria-label="tabs" className="mb-4">
              <TabTrigger value="ownership">Proof of Ownership</TabTrigger>
              <TabTrigger value="identity">Proof of Identity</TabTrigger>
              <TabTrigger value="privacy">Privacy Ecosystems</TabTrigger>
            </TabsList>
            <TabContent className="w-[900px] h-[340px]" value="ownership">
              <p>Ownershipt</p>
            </TabContent>
            <TabContent className="w-[900px] h-[340px]" value="identity">
              <p>Identity</p>
            </TabContent>
            <TabContent className="w-[900px] h-[340px]" value="privacy">
              <p>Privacy</p>
            </TabContent>
          </TabsRoot>
        </section>
      </div>

      <section
        className={cx(
          'object-cover bg-center bg-no-repeat bg-cover bg-dyed',
          'px-[72px] py-[156px] space-y-9'
        )}
      >
        <Heading2 className="text-center">
          How the Future of Privacy Scales
        </Heading2>
        <SubHeading className="text-center max-w-[900px] mx-auto">
          Webb connects cryptographic accumulators used in zero-knowledge
          applications so users can leverage the power of cross-chain
          zero-knowledge proofs.
        </SubHeading>

        <div className="w-[1000px] h-[483px] bg-mono-0 rounded-lg mx-auto"></div>
      </section>

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
                Cross-chain private applications require governance and
                trustless proof of events. Tangle provides that using threshold
                multi-party computation.
              </SubHeading2>

              <Button>Learn More</Button>
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
                A cross-chain private transaction system for privately moving
                and privately transferring assets between blockchains.
              </SubHeading2>
              <Button className="mt-6">Learn More</Button>
            </div>
          </div>

          <div className="flex space-x-6 max-w-[900px] mx-auto">
            <div className="max-w-[369px] my-auto">
              <Heading3>Connected Shielded Identity Protocols</Heading3>
              <SubHeading2 className="mt-2">
                A cross-chain system for creating identities and connecting
                groups between blockchains.
              </SubHeading2>
              <Button className="mt-6">Learn More</Button>
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

      <InActionSection />

      <ResearchAndDevelopmentSection />
    </>
  );
}

export default Index;
