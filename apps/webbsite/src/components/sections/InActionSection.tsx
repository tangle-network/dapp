import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
} from '@webb-tools/webb-ui-components/components/Tabs';

import cx from 'classnames';
import Image from 'next/image';
import Heading2 from '../Heading2';
import Heading4 from '../Heading4';
import SubHeading from '../SubHeading';
import SubHeading2 from '../SubHeading2';

const InActionSection = () => {
  return (
    <section
      className={cx(
        'object-cover bg-center bg-no-repeat bg-cover bg-in_action',
        'p-[156px] space-y-9'
      )}
    >
      <Heading2 className="text-center">Shielded Protocols in Action</Heading2>

      <SubHeading className="text-center">
        Try out the applications we’re building.
      </SubHeading>

      <TabsRoot
        className="rounded-lg bg-mono-0 max-w-[900px] mx-auto"
        defaultValue="stats"
      >
        <TabsList aria-label="in-action-tabs" className="p-4">
          <TabTrigger value="bridge">Bridge</TabTrigger>
          <TabTrigger value="stats">Stats</TabTrigger>
        </TabsList>

        <TabContent value="bridge" className="relative w-full h-[450px]">
          <Image
            src="/static/assets/moc-bridge.png"
            sizes="(max-width: 900px)"
            alt="moc-bridge"
            fill
          />

          <div className="absolute space-y-4 top-9 left-9 max-w-[378px]">
            <Heading4>Zero-Knowledge Cross-Chain Bridging</Heading4>

            <SubHeading2>
              A truly zero-knowledge cross-chain envornment to deposit,
              transfer, and withdraw funds.
            </SubHeading2>

            <Button>Make a Deposit</Button>
          </div>
        </TabContent>

        <TabContent value="stats">
          <div className="flex justify-between space-x-9 h-[450px]">
            <div className="space-y-4 max-w-[378px] pt-9 pl-9">
              <Heading4>
                Explore the Tangle Network with the stats page
              </Heading4>

              <SubHeading2>
                Monitor the health of the tangle network, watch proposals and
                more on the stats page.
              </SubHeading2>

              <Button>Explore Tangle</Button>
            </div>

            <div className="relative grow mt-14">
              <Image
                src="/static/assets/moc-stats.png"
                className="w-1/2"
                sizes="(max-width: 450px)"
                alt="moc-stats"
                fill
              />
            </div>
          </div>
        </TabContent>
      </TabsRoot>
    </section>
  );
};

export default InActionSection;
