import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';

import { BOND_DURATION } from '../../../constants/restake';
import Card from '../Card';
import ActionButton from './ActionButton';
import TxInput from './TxInput';

export default function DepositPage() {
  return (
    <Card>
      <div className="flex flex-col space-y-4 grow">
        <TxInput />

        <div className="flex flex-col justify-between gap-4 grow">
          <FeeDetails
            isDefaultOpen
            items={[
              {
                name: 'APY',
                info: 'Restaking Rewards',
              },
              {
                name: 'Withdraw Period',
                info: 'The duration for which the deposited asset is locked.',
                value: `${BOND_DURATION} eras`,
              },
            ]}
          />

          <ActionButton />
        </div>
      </div>
    </Card>
  );
}
