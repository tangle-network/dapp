import { Logo, Typography } from '@webb-tools/webb-ui-components';
import {
  Common2Icon,
  DiscordFill,
  GithubFill,
  TelegramFill,
  TwitterFill,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import Link from 'next/link';
import { useState } from 'react';
import {
  Heading2,
  Heading3,
  NewsletterForm,
  SubHeading2,
  InternalOrExternalLink,
  IInternalOrExternalLink,
} from '.';

type SocialType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href: string;
};

const socials: Array<SocialType> = [
  {
    Icon: Common2Icon,
    name: 'Commonwealth',
    href: 'https://commonwealth.im/webb',
  },
  {
    name: 'Telegram',
    Icon: TelegramFill,
    href: 'https://t.me/webbprotocol',
  },
  {
    name: 'Discord',
    Icon: DiscordFill,
    href: 'https://discord.com/invite/cv8EfJu3Tn',
  },
  {
    name: 'Twitter',
    Icon: TwitterFill,
    href: 'https://twitter.com/webbprotocol',
  },
  {
    name: 'Github',
    Icon: GithubFill,
    href: 'https://github.com/webb-tools',
  },
];

const links: Array<IInternalOrExternalLink> = [
  {
    label: 'Privacy Policy',
    url: '/privacy-policy',
    isInternal: false,
  },
  {
    label: 'Terms & Conditions',
    url: '/terms-and-conditions',
    isInternal: false,
  },
];

export const Footer = () => {
  // State for subscription success
  const [success, setSuccess] = useState(false);

  return (
    <footer className="dark pb-4 md:pb-[156px] bg-mono-200 space-y-6">
      {/** Newsletter */}
      <div className="px-4 py-16 space-y-12 md:pt-24 bg-mono-180 md:pb-9">
        {/** Title and subtitle */}
        <div className="md:pb-9 max-w-[900px] mx-auto space-y-6">
          <Heading2 className="text-[34px] leading-[46px]">
            Scaling Privacy for <br />
            Everyone, Everything, Everywhere.
          </Heading2>

          {!success && (
            <div className="space-y-6">
              <Heading3 className="text-lg leading-6 dark:text-mono-80">
                Follow for Updates
              </Heading3>

              <NewsletterForm onSuccess={() => setSuccess(true)} />

              <SubHeading2 className="dark:text-mono-100">
                By signing up you agree to{' '}
                <InternalOrExternalLink
                  {...links[1]}
                  className="inline-block dark:text-mono-0 hover:underline"
                >
                  terms & conditions
                </InternalOrExternalLink>
              </SubHeading2>
            </div>
          )}

          {success && (
            <div className="space-y-6">
              <Heading3>{"Now you're in the loop"}</Heading3>

              <SubHeading2>
                Thanks for signing up! Keep an eye on your inbox for updates
                from the Webb community.
              </SubHeading2>
            </div>
          )}
        </div>
      </div>

      {/** Links and socials */}
      <div className="w-full max-w-[900px] px-4 py-12 space-y-6 mx-auto">
        <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center space-x-4">
            {socials.map(({ Icon, name, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="dark:text-mono-0 dark:hover:text-mono-100"
              >
                <Icon className="w-8 h-8 !fill-current" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2 md:space-y-0 md:flex-row md:justify-between">
          <Typography variant="body1">
            © {new Date().getFullYear()} Webb Technologies, Inc. All rights
            reserved.
          </Typography>

          <div className="flex flex-col items-center space-y-1 xs:space-y-0 xs:flex-row xs:items-center xs:space-x-6">
            {links.map(({ label, ...restProps }, idx) => (
              <Typography
                key={`${label}-${idx}`}
                variant="body1"
                className="hover:underline"
              >
                <InternalOrExternalLink {...restProps}>
                  {label}
                </InternalOrExternalLink>
              </Typography>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
