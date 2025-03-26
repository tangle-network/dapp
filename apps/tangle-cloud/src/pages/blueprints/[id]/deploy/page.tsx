import { FC, useMemo, useState } from 'react';
import InfoSidebar from '../../../../components/InfoSidebar';
import { Typography } from '@tangle-network/ui-components';
import { DeployStep1 } from './DeploySteps/DeployStep1';

const DeployPage: FC = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Step 1',
      component: DeployStep1,
    },
  ];

  const StepComponent = useMemo(() => {
    return steps[step].component;
  }, [step]);

  return (
    <div className="flex justify-stretch items-stretch h-full">
      <InfoSidebar>
        <Typography variant="h5">Instance Settings</Typography>

        <Typography variant="body1" className='!text-mono-100'>
          Register to run Blueprints and start earning as you secure and execute
          service instances.
        </Typography>
      </InfoSidebar>

      <StepComponent errors={{}}/>
      
    </div>
  );
};

export default DeployPage;
