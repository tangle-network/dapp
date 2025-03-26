import { FC } from 'react';
import InfoSidebar from '../components/InfoSidebar';
import { Typography } from '@tangle-network/ui-components';
import InstanceHeader from '../components/InstanceHeader';

export const dynamic = 'force-static';

const DeployPage: FC = () => {
  return (
    <div className="flex justify-stretch items-stretch h-full">
      <InfoSidebar>
        <Typography variant="h5">Instance Settings</Typography>

        <Typography variant="body1">
          Register to run Blueprints and start earning as you secure and execute
          service instances.
        </Typography>
      </InfoSidebar>

      <div className="w-full pl-8">
        <InstanceHeader title="DFNS CGGMP21" creator="Tangle Network" />
      </div>
    </div>
  );
};

export default DeployPage;
