import { type FC } from 'react';
import {
  AddressChip,
  ChainChip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { chainsConfig } from '@webb-tools/dapp-config';

import { SectionWrapper, NoteOrAmountWrapper } from './Wrapper';
import { SourceOrDestinationWalletInfoProps } from './types';

const SourceOrDestinationWalletInfo: FC<SourceOrDestinationWalletInfoProps> = ({
  type,
  typedChainId,
  walletAddress,
  amount,
  fungibleTokenSymbol,
  wrappableTokenSymbol,
}) => {
  return (
    <SectionWrapper>
      <div className="flex justify-between items-center">
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
      <NoteOrAmountWrapper className="flex justify-between items-center">
        <Typography variant="body2">Amount</Typography>
        <Typography variant="body2" fw="bold">
          {`${amount} ${wrappableTokenSymbol ?? fungibleTokenSymbol}`}
        </Typography>
      </NoteOrAmountWrapper>
    </SectionWrapper>
  );
};

export default SourceOrDestinationWalletInfo;
