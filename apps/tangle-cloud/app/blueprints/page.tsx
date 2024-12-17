import TopBanner from '@webb-tools/tangle-shared-ui/components/blueprints/TopBanner';
import BlueprintListing from './BlueprintListing';

export const dynamic = 'force-static';

const Page = () => {
  return (
    <div className="px-4 space-y-5">
      <TopBanner />

      <BlueprintListing />
    </div>
  );
};

export default Page;
