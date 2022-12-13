import { ChainIcon } from '@webb-tools/icons';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
} from '@webb-tools/webb-ui-components/components/Tabs';

import Heading2 from '../Heading2';
import SubHeading from '../SubHeading';

const PrivacyConnectedSection = () => {
  return (
    <section className="max-w-[932px] flex flex-col justify-center absolute bottom-28 left-1/2 -translate-x-1/2 w-full">
      <ChainIcon name="tangle" className="mx-auto w-7 h-7" />
      <Heading2 className="text-[48px] leading-[72px] text-mono-200 font-bold text-center mt-6">
        The Future of privacy is Connected
      </Heading2>
      <SubHeading className="text-center mt-9">
        Connecting private applications across chains allows us to scale the
        size of privacy sets to encompass all the users and data possible in our
        Web3 ecosystem.
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
  );
};

export default PrivacyConnectedSection;
