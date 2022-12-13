import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';
import { Input } from '@webb-tools/webb-ui-components/components/Input/Input';
import { Logo } from '@webb-tools/webb-ui-components/components/Logo/Logo';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';

import {
  Common2Icon,
  DiscordFill,
  GithubFill,
  TelegramFill,
  TwitterFill,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';

import Link from 'next/link';
import Heading2 from './Heading2';
import Heading3 from './Heading3';
import SubHeading from './SubHeading';

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
  return (
    <footer
      className={cx(
        'object-cover bg-center bg-no-repeat bg-cover bg-in_action',
        'p-[156px] space-y-6 flex flex-col justify-center'
      )}
    >
      {/** Title and subtitle */}
      <div className="pb-9 max-w-[900px] mx-auto space-y-6">
        <Heading2 className="text-center">
          Open Source and Community Driven
        </Heading2>
        <SubHeading className="text-center max-w-[713px] mx-auto">
          Webb is an open source community driven by a common passion for
          cross-chain privacy. Explore how you can contribute.
        </SubHeading>
      </div>

      {/** Newsletter */}
      <div
        className={cx(
          'bg-mono-0 shadow-md rounded-lg',
          'p-9 space-y-6 mx-auto'
        )}
      >
        <Heading3 className="text-center">Follow for Updates</Heading3>

        {/** Email input */}
        <form
          className={cx(
            'bg-mono-20 rounded-full p-4',
            'flex w-[555px] items-center justify-between space-x-6'
          )}
        >
          <div className="flex items-center space-x-2 grow">
            <span className="text-2xl">✉️</span>
            <Input
              placeholder="Satoshi@nakamo.to"
              isRequired
              className="grow"
              id="email"
              name="email"
              type="email"
              size="sm"
            />
          </div>

          <Button type="submit">Subscribe</Button>
        </form>
      </div>

      {/** Links and socials */}
      <div className="py-12 space-y-6 w-full max-w-[900px] mx-auto">
        <div className="flex items-center justify-between">
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
                className="text-mono-100 hover:text-mono-200 dark:hover:text-mono-40"
              >
                <Icon className="w-8 h-8 !fill-current" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Typography variant="body1">© Text & graphics Apache 2.0</Typography>

          <div className="flex items-center space-x-6">
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
