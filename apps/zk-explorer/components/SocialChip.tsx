import { IconBase } from '@webb-tools/icons/types';
import { FC } from 'react';
import { SmallChip } from './SmallChip';

type SocialChipProps = {
  href: string;
  title: string;
  Icon: (props: IconBase) => JSX.Element;
};

const SocialChip: FC<SocialChipProps> = ({ Icon, href, title }) => {
  return (
    <a target="_blank" rel="noopener noreferrer" title={title} href={href}>
      <SmallChip
        color="grey"
        className="bg-[rgba(0,0,0,.4)] dark:bg-mono-140 hover:bg-mono-120 !text-mono-0"
      >
        <Icon className="fill-mono-0" size="md" />
      </SmallChip>
    </a>
  );
};

export default SocialChip;
