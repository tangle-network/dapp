import {
  CopyWithTooltip,
  shortenHex,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
  useHiddenValue,
} from '@tangle-network/ui-components';
import { Avatar } from '@tangle-network/ui-components/components/Avatar';
import { IconWithTooltip } from '@tangle-network/ui-components/components/IconWithTooltip';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

const AccountAddress: FC = () => {
  const { address } = useAccount();
  const [isHiddenValue] = useHiddenValue();

  const displayAddress = useMemo(() => {
    if (!address) return null;
    if (isHiddenValue) {
      return Array.from({ length: 42 })
        .map(() => '*')
        .join('');
    }
    return address;
  }, [address, isHiddenValue]);

  const shortenFn = isHiddenValue ? shortenString : shortenHex;

  return (
    <div className="flex items-center gap-1">
      <IconWithTooltip
        icon={
          address ? (
            <Avatar value={address} theme="ethereum" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-mono-40 dark:bg-mono-160" />
          )
        }
        content="Account address"
      />

      <Typography variant="body1">Address:</Typography>

      <Tooltip>
        <TooltipTrigger className="cursor-default">
          <Typography variant="body1" fw="normal" className="text-mono-160">
            {displayAddress !== null
              ? shortenFn(displayAddress, 4)
              : EMPTY_VALUE_PLACEHOLDER}
          </Typography>
        </TooltipTrigger>

        <TooltipBody className="max-w-full">{address}</TooltipBody>
      </Tooltip>

      {address && (
        <CopyWithTooltip
          className="!bg-transparent !p-0"
          iconClassName="dark:!fill-mono-80 !fill-mono-160"
          copyLabel="Copy address"
          textToCopy={address}
        />
      )}
    </div>
  );
};

export default AccountAddress;
