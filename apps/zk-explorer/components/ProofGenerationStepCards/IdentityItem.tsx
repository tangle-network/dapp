import { ExternalLinkLine } from '@webb-tools/icons';
import { Avatar, shortenHex } from '@webb-tools/webb-ui-components';
import { WEBB_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import { FC } from 'react';

type IdentityItemProps = {
  address: string;
  avatarUrl: string;
};

const IdentityItem: FC<IdentityItemProps> = ({ address, avatarUrl }) => {
  return (
    <a
      href={WEBB_DOCS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-1 items-center"
    >
      <Avatar src={avatarUrl} />

      {shortenHex(address)}

      <ExternalLinkLine />
    </a>
  );
};

export default IdentityItem;
