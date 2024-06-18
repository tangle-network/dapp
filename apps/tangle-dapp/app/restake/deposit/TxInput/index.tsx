import { ArrowRight } from '@webb-tools/icons/ArrowRight';

import DestChainInput from './DestChainInput';
import SourceChainInput from './SourceChainInput';

export default function TxInput() {
  return (
    <div className="space-y-2">
      <SourceChainInput />

      <ArrowRight size="lg" className="mx-auto rotate-90" />

      <DestChainInput />
    </div>
  );
}
