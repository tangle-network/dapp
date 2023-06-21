/* eslint-disable @next/next/no-img-element */
import { Button, Logo, Typography } from '@webb-tools/webb-ui-components';
import {
  WEBB_MKT_URL,
  TANGLE_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';

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
    <section className="py-[60px]">
      {/* DETAILS */}
      <div className="max-w-[1440px] mx-auto grid gap-[70px] px-3 lg:grid-cols-2 lg:items-center lg:px-[40px] xl:px-[160px]">
        <div className="md:w-[75%] lg:w-full flex flex-col gap-6 items-start">
          <Typography
            variant="mkt-h3"
            className="font-black text-left text-mono-200"
          >
            Tangle Network is supported by...
          </Typography>
          <Typography
            variant="mkt-body1"
            className="mt-3 font-medium text-left text-mono-140"
          >
            Tangle Network is built by Webb Foundation, with support from
            various established industry programs and partners.
          </Typography>
          <div className="flex gap-4 mt-3">
            <Button
              href={TANGLE_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              className="bg-inherit"
            >
              Learn More
            </Button>
            <Button href={WEBB_MKT_URL} target="_blank" rel="noreferrer">
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
