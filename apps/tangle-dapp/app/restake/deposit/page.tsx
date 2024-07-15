import { LockClosedIcon, ShuffleIcon } from '@radix-ui/react-icons';
import UserFillIcon from '@webb-tools/icons/UserFillIcon';

import {
  HowItWorks,
  HowItWorksStep,
  type HowItWorksStepProps,
} from '../../../components/HowItWorks';
import DepositForm from './DepositForm';

const HOW_IT_WORKS_STEPS = [
  {
    title: 'Bridge',
    description:
      'Select whitelisted Liquid Staking Tokens (LST) to bridge to Tangle Mainnet',
    Icon: ShuffleIcon,
  },
  {
    title: 'Deposit',
    description: 'Deposit bridged token to Tangle Mainnet’s restake vault',
    Icon: LockClosedIcon,
  },
  {
    title: 'Delegate (optional)',
    description: 'Select operator for delegation to complete restaking',
    Icon: UserFillIcon,
  },
] as const satisfies Array<
  Pick<HowItWorksStepProps, 'title' | 'description' | 'Icon'>
>;

export default function DepositPage() {
  return (
    <div className="flex flex-col gap-4">
      <DepositForm />

      <HowItWorks>
        {HOW_IT_WORKS_STEPS.map(({ title, description, Icon }, idx) => (
          <HowItWorksStep
            key={`${title}-${description}-${idx}`}
            title={title}
            description={description}
            Icon={Icon}
          />
        ))}
      </HowItWorks>
    </div>
  );
}
