import { ArrowRight } from '@webb-tools/icons/ArrowRight';

import TabsList from '../TabsList';
import ActionButton from './ActionButton';
import DestChainInput from './DestChainInput';
import SourceChainInput from './SourceChainInput';
import TxDetails from './TxDetails';

export default function DepositPage() {
  return (
    <div className="flex flex-col space-y-4 grow">
      <TabsList />

      <div className="space-y-2">
        <SourceChainInput />

        <ArrowRight size="lg" className="mx-auto rotate-90" />

        <DestChainInput />
      </div>

      <div className="flex flex-col justify-between gap-4 grow">
        <TxDetails />

        <ActionButton />
      </div>
    </div>
  );
}
