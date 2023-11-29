import {
  Link as LinkIcon,
  Mail as MailIcon,
  TwitterFill,
} from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { ComponentProps, FC, PropsWithChildren } from 'react';

import type { IdentityType } from './types';

const IdentityCell: FC<{ identity: IdentityType }> = ({ identity }) => {
  if (identity == null) {
    return (
      <Typography variant="mkt-small-caps" fw="bold" ta="center">
        -
      </Typography>
    );
  }

  const {
    info: { twitter, web, email },
  } = identity;

  if (!twitter && !web && !email) {
    return (
      <Typography variant="mkt-small-caps" fw="bold" ta="center">
        -
      </Typography>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`https://x.com/${twitter.replace('@', '')}`}
        isDisabled={!twitter}
      >
        <TwitterFill className="!fill-current" />
      </Link>

      <Link href={web} isDisabled={!web}>
        <LinkIcon className="!fill-current" />
      </Link>

      <Link href={`mailto:${email}`} isDisabled={!email}>
        <MailIcon />
      </Link>
    </div>
  );
};

export default IdentityCell;

/** @internal */

type LinkProps = {
  isDisabled: boolean;
  href: ComponentProps<'a'>['href'];
};

const Link: FC<PropsWithChildren<LinkProps>> = ({
  href,
  isDisabled,
  children,
}) => {
  if (isDisabled) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="!text-inherit"
    >
      {children}
    </a>
  );
};
