import {
  Common2Icon,
  DiscordFill,
  GithubFill,
  LinkedInFill,
  TelegramFill,
  TwitterFill,
  YouTubeFill,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import Link from 'next/link';
import { ComponentProps, useState } from 'react';

import { Typography } from '../../typography';
import { Logo } from '../Logo';
import { InternalOrExternalLink } from '../Navbar/InternalOrExternalLink';
import { TangleLogo } from '../TangleLogo';
import { WebsiteNewsletterForm } from '../WebsiteNewsLetterForm';

type NavLinkType = {
  group: string;
  links: Array<
    ComponentProps<typeof InternalOrExternalLink> & { label: string }
  >;
};

type SocialType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href: string;
};

const navLinks: Array<NavLinkType> = [
  {
    group: 'Community',
    links: [
      {
        label: 'Github',
        url: 'https://github.com/webb-tools',
        isInternal: false,
      },
      {
        label: 'Telegram',
        url: 'https://t.me/webbprotocol',
        isInternal: false,
      },
      {
        label: 'Discord',
        url: 'https://discord.com/invite/cv8EfJu3Tn',
        isInternal: false,
      },
      {
        label: 'Twitter',
        url: 'https://twitter.com/webbprotocol',
        isInternal: false,
      },
      {
        label: 'Commonwealth',
        url: 'https://commonwealth.im/webb',
        isInternal: false,
      },
    ],
  },
  {
    group: 'Ecosystem',
    links: [
      {
        label: 'Tangle',
        url: 'https://polkadot.js.org/apps/?rpc=wss://tangle-standalone-archive.webb.tools#/explorer',
        isInternal: false,
      },
      {
        label: 'DKG Explorer',
        url: 'https://stats.webb.tools/',
        isInternal: false,
      },
      {
        label: 'Hubble Bridge',
        url: 'https://app.webb.tools/',
        isInternal: false,
      },
    ],
  },
  {
    group: 'Developer',
    links: [
      {
        label: 'Documentation',
        url: 'https://docs.webb.tools/',
        isInternal: false,
      },
      {
        label: 'Source Code',
        url: 'https://github.com/webb-tools',
        isInternal: false,
      },
      {
        label: 'Whitepaper',
        url: 'https://eprint.iacr.org/2023/260',
        isInternal: false,
      },
    ],
  },
  {
    group: 'Company',
    links: [
      {
        label: 'About Us',
        url: 'https://webb.tools',
        isInternal: false,
      },
      {
        label: 'Careers',
        url: 'https://angel.co/company/webb-4/jobs',
        isInternal: false,
      },
      {
        label: 'Brand Kit',
        url: '/brand-kit',
        isInternal: false,
      },
    ],
  },
  {
    group: 'Legal',
    links: [
      {
        label: 'Privacy Policy',
        url: '/privacy-policy',
        isInternal: false,
      },
      {
        label: 'Terms of Service',
        url: '/terms-and-conditions',
        isInternal: false,
      },
    ],
  },
];

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
    name: 'LinkedIn',
    Icon: LinkedInFill,
    href: 'https://www.linkedin.com/company/webb-protocol/',
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
  {
    name: 'YouTube',
    Icon: YouTubeFill,
    href: 'https://webb.tools/blog/videos',
  },
];

type WebsiteFooterPropsType = {
  type: 'webbsite' | 'tangle';
};

export const WebsiteFooter = ({ type }: WebsiteFooterPropsType) => {
  // State for subscription success
  const [success, setSuccess] = useState(false);

  return (
    <footer className="dark pb-4 md:pb-[156px] bg-mono-200 space-y-6">
      {/** Newsletter */}
      <div className="px-4 py-16 space-y-12 md:pt-24 bg-mono-180 md:pb-9">
        {/** Title and subtitle */}
        <div className="md:pb-9 max-w-[900px] mx-auto space-y-6">
          <Typography variant="mkt-h2" className="text-[34px] leading-[46px]">
            Scaling Privacy for <br />
            Everyone, Everything, Everywhere.
          </Typography>

          {!success && (
            <div className="space-y-6">
              <Typography
                variant="mkt-h3"
                className="text-lg leading-6 dark:text-mono-80"
              >
                Follow for Updates
              </Typography>

              <WebsiteNewsletterForm onSuccess={() => setSuccess(true)} />

              <Typography variant="mkt-caption" className="dark:text-mono-100">
                By signing up you agree to{' '}
                <InternalOrExternalLink
                  url="/terms-and-conditions"
                  isInternal={false}
                  className="inline-block dark:text-mono-0 hover:underline"
                >
                  terms & conditions
                </InternalOrExternalLink>
              </Typography>
            </div>
          )}

          {success && (
            <div className="space-y-6">
              <Typography variant="mkt-h3">
                {"Now you're in the loop"}
              </Typography>

              <Typography variant="mkt-caption">
                Thanks for signing up! Keep an eye on your inbox for updates
                from the Webb community.
              </Typography>
            </div>
          )}
        </div>
      </div>

      {/** Navigation Links */}
      <div className="w-full max-w-[900px] flex flex-col gap-9 px-4 py-12 mx-auto">
        {type === 'tangle' && (
          <Typography variant="body1" className="text-center md:text-left">
            Built by Webb Foundation
          </Typography>
        )}

        {/** Logo and links */}
        <div className="flex flex-col items-center space-y-4 md:items-start md:space-y-0 md:space-x-8 md:flex-row md:justify-between">
          <Link href="/">{type === 'tangle' ? <TangleLogo /> : <Logo />}</Link>
          {navLinks.map(({ group, links }) => (
            <div className="hidden md:flex md:flex-col flex-[1]">
              <Typography variant="body1" fw="bold" className="!text-lg mb-4">
                {group}
              </Typography>
              <div className="flex flex-col gap-2">
                {links.map(({ label, ...restProps }) => (
                  <Typography variant="body1" className="hover:underline">
                    <InternalOrExternalLink {...restProps}>
                      {label}
                    </InternalOrExternalLink>
                  </Typography>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/** Socials */}
        <div className="flex items-center justify-center space-x-4 md:justify-end">
          {socials.map(({ Icon, name, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="dark:text-mono-0 dark:hover:text-mono-100"
            >
              <Icon className="w-8 h-8 !fill-mono-60" />
            </a>
          ))}
        </div>

        <Typography variant="body1" className="text-center md:text-right">
          © {new Date().getFullYear()} Webb Technologies, Inc. All rights
          reserved.
        </Typography>
      </div>
    </footer>
  );
};
