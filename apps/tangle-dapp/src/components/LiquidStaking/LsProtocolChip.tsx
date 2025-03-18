import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { SkeletonLoader, Typography } from '@tangle-network/ui-components';
import { FC } from 'react';
import InputWrapper from '../InputWrapper';

const LsProtocolChip: FC = () => {
  const network = useNetworkStore((store) => store.network2);

  return (
    <InputWrapper title="Protocol" id="ls-protocol-chip" isFullWidth>
      <div className="flex items-center justify-start gap-2 rounded-lg">
        <LsTokenIcon name="tnt" />

        {network !== undefined ? (
          <Typography variant="h5" fw="bold">
            {network.name} &mdash; {network.tokenSymbol}
          </Typography>
        ) : (
          <SkeletonLoader className="w-20" />
        )}
      </div>
    </InputWrapper>
  );
};

export default LsProtocolChip;
