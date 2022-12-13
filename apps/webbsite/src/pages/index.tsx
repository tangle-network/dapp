import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';
import Image from 'next/image';

import Heading2 from '../components/Heading2';
import Heading3 from '../components/Heading3';
import HeroSection from '../components/sections/HeroSection';
import InActionSection from '../components/sections/InActionSection';
import PrivacyConnectedSection from '../components/sections/PrivacyConnectedSection';
import PrivacyScaleSection from '../components/sections/PrivacyScaleSection';
import ResearchAndDevelopmentSection from '../components/sections/ResearchAndDevelopmentSection';
import SubHeading from '../components/SubHeading';
import SubHeading2 from '../components/SubHeading2';

export function Index() {
  return (
    <>
      <div className="relative object-cover bg-no-repeat bg-cover bg-hero_bg_image h-[2250px] bg-top">
        <HeroSection />

        <PrivacyConnectedSection />
      </div>

      <PrivacyScaleSection />

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
