/* eslint-disable @next/next/no-img-element */
import { Button, Logo } from '@webb-tools/webb-ui-components';
import { SectionTitle, SectionDescription } from '..';
import { STATS_DEV_URL, WEBB_DOCS_URL } from '../../constants';

type SupportedBySectionCardType = {
  logo: string | (() => JSX.Element);
  name: string;
  href: string;
};

const cardItems: Array<SupportedBySectionCardType> = [
  {
    logo: () => <Logo />,
    name: 'Webb',
    href: 'https://t.me/webbprotocol',
  },
  {
    logo: '/static/svgs/commonwealth.svg',
    name: 'Commonwealth Labs',
    href: 'https://t.me/webbprotocol',
  },
  {
    logo: '/static/svgs/web3Foundation.svg',
    name: 'Web3 Foundation',
    href: 'https://t.me/webbprotocol',
  },
  {
    logo: '/static/svgs/substrateBuildersProgram.svg',
    name: 'Substrate Builders Program',
    href: 'https://t.me/webbprotocol',
  },
];

export const SupportedBySection = () => {
  return (
    <section className="">
      {/* DETAILS */}
      <div className="flex flex-col items-start">
        <SectionTitle className="text-left">
          Tangle Network is supported by
        </SectionTitle>
        <SectionDescription className="mt-6 text-left">
          Tangle Network is built by Webb Foundation, with support from various
          established industry programs and partners.
        </SectionDescription>
        <div className="flex gap-4 mt-8">
          <Button
            href={WEBB_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            className="button-base-2 bg-inherit"
          >
            Learn More
          </Button>
          <Button
            href={STATS_DEV_URL}
            target="_blank"
            rel="noreferrer"
            className="button-base-2"
          >
            Visit Webb
          </Button>
        </div>
      </div>
      {/* CARDS */}
      <div className="">
        {cardItems.map(({ logo, name, href }) => {
          return (
            <SupportedBySectionCard
              key={name}
              logo={logo}
              name={name}
              href={href}
            />
          );
        })}
      </div>
    </section>
  );
};

const SupportedBySectionCard = ({
  logo,
  name,
  href,
}: SupportedBySectionCardType) => {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      <div className="flex flex-col items-center justify-center w-full">
        {typeof logo === 'string' ? <img src={logo} alt={name} /> : logo()}
      </div>
    </a>
  );
};
