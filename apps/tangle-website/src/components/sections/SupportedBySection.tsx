/* eslint-disable @next/next/no-img-element */
import { Button, Logo } from '@webb-tools/webb-ui-components';
import { SectionTitle, SectionDescription } from '..';
import { WEBB_URL, TANGLE_NETWORK_DOCS_URL } from '../../constants';

type SupportedBySectionCardType = {
  logo: string | (() => JSX.Element);
  name: string;
  href: string;
};

const cardItems: Array<SupportedBySectionCardType> = [
  {
    logo: () => <Logo />,
    name: 'Webb',
    href: 'https://webb.tools/',
  },
  {
    logo: '/static/svgs/commonwealth.svg',
    name: 'Commonwealth Labs',
    href: 'https://commonwealth.im/',
  },
  {
    logo: '/static/svgs/web3Foundation.svg',
    name: 'Web3 Foundation',
    href: 'https://web3.foundation/grants/',
  },
  {
    logo: '/static/svgs/substrateBuildersProgram.svg',
    name: 'Substrate Builders Program',
    href: 'https://substrate.io/ecosystem/substrate-builders-program/',
  },
];

export const SupportedBySection = () => {
  return (
    <section className="grid gap-[70px] px-3 pb-[80px] lg:grid-cols-2 lg:items-center lg:px-[40px] xl:px-[160px]">
      {/* DETAILS */}
      <div className="flex flex-col items-start">
        <SectionTitle className="text-left">
          Tangle Network is supported by...
        </SectionTitle>
        <SectionDescription className="mt-3 text-left">
          Tangle Network is built by Webb Foundation, with support from various
          established industry programs and partners.
        </SectionDescription>
        <div className="flex gap-4 mt-3">
          <Button
            href={TANGLE_NETWORK_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            className="button-base-2 bg-inherit"
          >
            Learn More
          </Button>
          <Button
            href={WEBB_URL}
            target="_blank"
            rel="noreferrer"
            className="button-base-2"
          >
            Visit Webb
          </Button>
        </div>
      </div>
      {/* CARDS */}
      <div className="grid gap-2 md:grid-cols-2">
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

/**
 * Internal component for rendering a card in the SupportedBySection
 */
const SupportedBySectionCard = ({
  logo,
  name,
  href,
}: SupportedBySectionCardType) => {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      <div className="flex flex-col items-center justify-center w-full bg-mono-0 h-[110px]">
        {typeof logo === 'string' ? (
          <img src={logo} alt={name} className="max-w-[180px]" />
        ) : (
          logo()
        )}
      </div>
    </a>
  );
};
