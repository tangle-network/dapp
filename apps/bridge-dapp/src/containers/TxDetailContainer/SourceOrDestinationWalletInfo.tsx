import { type FC } from 'react';
import {
  AddressChip,
  ChainChip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { chainsConfig } from '@webb-tools/dapp-config';

import { SectionWrapper, NoteOrAmountWrapper } from './Wrapper.js';
import { SourceOrDestinationWalletInfoProps } from './types.js';

const SourceOrDestinationWalletInfo: FC<SourceOrDestinationWalletInfoProps> = ({
  type,
  typedChainId,
  walletAddress,
  amount,
  fungibleTokenSymbol,
  wrapTokenSymbol,
  unwrapTokenSymbol,
}) => {
  return (
    <SectionWrapper>
      <div className="flex items-center justify-between">
        <Typography variant="body2" fw="bold">
          {type === 'source' ? 'Source' : 'Destination'}
        </Typography>
        <div className="flex items-center gap-2">
          <ChainChip
            chainName={chainsConfig[typedChainId].name}
            chainType={chainsConfig[typedChainId].group}
          />
          <AddressChip address={walletAddress ?? ''} />
        </div>
      </div>
      <NoteOrAmountWrapper className="flex items-center justify-between">
        <Typography variant="body2">Amount</Typography>
        <Typography variant="body2" fw="bold">
          {`${amount} ${
            wrapTokenSymbol ?? unwrapTokenSymbol ?? fungibleTokenSymbol
          }`}
        </Typography>
      </NoteOrAmountWrapper>
    </SectionWrapper>
  );
};

export default SourceOrDestinationWalletInfo;
