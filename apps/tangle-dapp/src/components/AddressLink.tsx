import { HexString } from '@polkadot/util/types';
import { ArrowRightUp } from '@webb-tools/icons';
import { shortenString, Typography } from '@webb-tools/webb-ui-components';
import type { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { FC, MouseEvent, useCallback } from 'react';

export type AddressLinkProps = {
  address: SubstrateAddress | HexString;
};

const AddressLink: FC<AddressLinkProps> = ({ address }) => {
  // TODO: Determine href. Currently, there doesn't seem to be any logical place to link to based on the address.
  const href = '#';

  // Stop propagation to prevent a parent modal (if any) from closing.
  const handleClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  }, []);

  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      onClick={handleClick}
      className="flex items-center justify-start gap-1 hover:underline"
    >
      <Typography variant="body1" fw="normal" className="dark:text-mono-0">
        {shortenString(address, 6)}
      </Typography>

      <ArrowRightUp className="dark:fill-mono-0" />
    </a>
  );
};

export default AddressLink;
