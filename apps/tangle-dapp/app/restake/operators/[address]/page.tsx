import OperatorInfoCard from './OperatorInfoCard';
import RegisteredBlueprintsCard from './RegisteredBlueprintsCard';

export const dynamic = 'force-static';

const page = ({ params: { address } }: { params: { address: string } }) => {
  return (
    <div>
      <div className="flex items-stretch gap-5">
        <OperatorInfoCard className="flex-1" />

        <RegisteredBlueprintsCard className="flex-1" />
      </div>
    </div>
  );
};

export default page;
