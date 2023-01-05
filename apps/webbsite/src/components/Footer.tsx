import { Logo } from '@webb-tools/webb-ui-components/components/Logo/Logo';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

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

import Heading2 from './Heading2';
import Heading3 from './Heading3';
import NewletterForm from './NewletterForm';
import SubHeading2 from './SubHeading2';

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
    name: 'Telagram',
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

const links = [
  {
    name: 'Privacy Policy',
    href: '#', // TODO: add privacy policy link
  },
  {
    name: 'Terms & Conditions',
    href: '#', // TODO: add terms and conditions link
  },
];

const Footer = () => {
  // State for subscription success
  const [success, setSuccess] = useState(false);

  return (
    <footer className="dark pb-4 md:pb-[156px] bg-mono-200 space-y-6">
      {/** Newsletter */}
      <div className="px-4 py-16 space-y-12 md:pt-24 bg-mono-180 md:pb-9">
        {/** Title and subtitle */}
        <div className="md:pb-9 max-w-[900px] mx-auto space-y-6">
          <Heading2 className="p-2.5 text-[34px] leading-[46px]">
            Scaling Privacy for <br />
            Everyone, Everything, Everywhere.
          </Heading2>

          {!success && (
            <div className="space-y-6">
              <Heading3 className="text-lg leading-6 dark:text-mono-20">
                Follow for Updates
              </Heading3>

              <NewletterForm onSuccess={() => setSuccess(true)} />

              <SubHeading2 className="dark:text-mono-100">
                By signing up you agree to{' '}
                <a
                  href={links[1].href}
                  rel="noopener noreferrer"
                  className="dark:text-mono-0 hover:underline"
                >
                  terms & conditions
                </a>
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

        <div className="flex flex-col items-center space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
          <Typography variant="body1">Copyright © 2022</Typography>

          <div className="flex flex-col items-center space-y-1 xs:space-y-0 xs:flex-row xs:items-center xs:space-x-6">
            {links.map(({ name, href }, idx) => (
              <Typography
                key={`${name}-${idx}`}
                variant="body1"
                className="hover:underline"
              >
                <a target="_blank" rel="noreferrer" href={href}>
                  {name}
                </a>
              </Typography>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
