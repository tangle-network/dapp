import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';
import { Input } from '@webb-tools/webb-ui-components/components/Input/Input';
import { Logo } from '@webb-tools/webb-ui-components/components/Logo/Logo';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

import {
  Common2Icon,
  DiscordFill,
  GithubFill,
  InformationLine,
  TelegramFill,
  TwitterFill,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import Heading2 from './Heading2';
import Heading3 from './Heading3';
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
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formEl = event.currentTarget;

      console.dir(formEl);

      const nameInput = formEl.elements.namedItem('name');
      const emailInput = formEl.elements.namedItem('email');

      if (!nameInput || !emailInput) {
        console.warn("Can't find name or email input");
        return;
      }

      const name = (nameInput as HTMLInputElement).value;
      const email = (emailInput as HTMLInputElement).value;

      if (!name || !email) {
        setError('Please fill in all fields');
        return;
      }

      // Form the request for sending data to the server.
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      };

      const endpoint = '/api/subscribers';

      try {
        setLoading(true);
        const response = await fetch(endpoint, options);
        if (response.status === 200) {
          // Success then reset the form
          setName('');
          setEmail('');
          setError(null);
        } else {
          // Error
          const { message } = await response.json();
          setError(message);
        }
      } catch (error) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    []
  );

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

          <div className="space-y-6">
            <Heading3 className="text-lg leading-6 dark:text-mono-20">
              Follow for Updates
            </Heading3>

            {/** Email input */}
            <div>
              <form
                className="flex flex-col space-y-4 sm:items-center sm:space-y-0 sm:flex-row sm:space-x-2"
                name="newsletter"
                id="newsletter"
                onSubmit={handleSubmit}
              >
                <Input
                  className="grow shrink basis-0"
                  id="name"
                  isRequired
                  name="name"
                  placeholder="Name"
                  value={name}
                  onChange={(val) => setName(val)}
                />
                <Input
                  className="grow shrink basis-0"
                  id="email"
                  isRequired
                  name="email"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(val) => setEmail(val)}
                />
                <div className="grow shrink basis-0">
                  <Button
                    isLoading={loading}
                    type="submit"
                    variant="primary"
                    isFullWidth
                  >
                    Subscribe
                  </Button>
                </div>
              </form>
              {error && (
                <span className="flex mt-4 dark:text-red-50">
                  <InformationLine className="!fill-current mr-1" />
                  <Typography
                    variant="body3"
                    fw="bold"
                    className="!text-current"
                  >
                    {error}
                  </Typography>
                </span>
              )}
            </div>

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
