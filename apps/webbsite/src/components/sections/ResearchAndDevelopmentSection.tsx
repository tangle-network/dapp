import { Button } from '@webb-tools/webb-ui-components';
import React from 'react';
import { Heading2, Heading3, SubHeading1, SubHeading2 } from '../../components';
import { twMerge } from 'tailwind-merge';

export type Section = {
  icon: React.ReactNode;
  title: string;
  description: string;
  sourceCodeUrl: string;
  documentationUrl: string;
};

const sections: Array<Section> = [
  {
    icon: <AnchorIcon />,
    title: 'Anchor System',
    description: `A technical protocol for connecting many cryptographic accumulators together and enabling zero-knowledge proofs of membership between them.`,
    sourceCodeUrl: 'https://github.com/webb-tools/protocol-solidity',
    documentationUrl: 'https://docs.webb.tools/docs/anchor-system/overview/',
  },
  {
    icon: <DistributedKeygenIcon />,
    title: 'Distributed Key Generation Protocols',
    description:
      'We leverage multi-party computation protocols used to decentralize trust over a set of parties to facilitate governance and operation of Anchor System instances.',
    sourceCodeUrl: 'https://github.com/webb-tools/dkg-substrate',
    documentationUrl: 'https://docs.webb.tools/docs/protocols/dkg/overview/',
  },
  {
    icon: <ZkMessagingIcon />,
    title: 'Zero-knowledge Messaging',
    description:
      'The message schema and circuits that enable zero-knowledge proofs of membership and property testing for assets, identities, and data.',
    sourceCodeUrl: 'https://github.com/webb-tools/zero-knowledge-gadgets',
    documentationUrl:
      'https://github.com/webb-tools/zero-knowledge-gadgets#--table-of-contents',
  },
];

export const ResearchAndDevelopmentSection = () => {
  return (
    <section className="py-16 md:py-[156px] flex items-center justify-center w-full">
      <div className="max-w-[900px]">
        <Heading2 className="px-4 text-center text-mono-200">Research & Development</Heading2>

        <SubHeading1 className="mt-6 px-4 text-center mx-auto max-w-[773px] text-mono-180">
          Building interoperable zero-knowledge applications to scale privacy
          for all users in the Web3 ecosystem.
        </SubHeading1>

        <div className="space-y-4 mt-9">
          {sections.map((section, idx) => (
            <div
              key={`${section.title}-${idx}`}
              className="flex p-4 space-x-4 md:space-x-6 md:p-9"
            >
              {section.icon}

              <div>
                <Heading3 className='text-mono-200'>{section.title}</Heading3>
                <SubHeading2 className="mt-2 text-mono-160">
                  {section.description}
                </SubHeading2>

                <div className="flex flex-col mt-4 space-y-2 md:mt-6 xs:space-y-0 xs:flex-row xs:space-x-2">
                  <Button
                    variant="link"
                    href={section.sourceCodeUrl}
                    target="_blank"
                  >
                    Source Code
                  </Button>
                  <Button
                    variant="link"
                    href={section.documentationUrl}
                    target="_blank"
                  >
                    Documentation
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function AnchorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="text-[50px] md:text-[100px]">
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className={twMerge(
          'shadow-[0_-4px_8px_0_rgba(0,0,0,0.2),-32px_-32px_72px_0_rgba(212,230,254,1)] rounded-lg',
          props.className
        )}
      >
        <g clipPath="url(#prefix__clip0_1038_47448)">
          <rect width={100} height={100} rx={8} fill="#ECF4FF" />
          <g filter="url(#prefix__filter0_d_1038_47448)">
            <path
              d="M53.57 42.116v37.286c12.922-1.68 23.162-12.372 24.772-25.856h-10.49l13.225-22.089a38.366 38.366 0 014.627 18.358c0 20.583-15.985 37.272-35.704 37.272-19.72 0-35.704-16.69-35.704-37.272 0-6.676 1.682-12.94 4.627-18.358l13.225 22.089h-10.49c1.61 13.484 11.854 24.176 24.772 25.856V42.116c-3.358-.912-6.282-3.061-8.226-6.048a15.293 15.293 0 01-2.337-10.182c.437-3.576 2.113-6.865 4.713-9.252 2.601-2.387 5.95-3.71 9.42-3.72 3.479-.003 6.839 1.312 9.45 3.699 2.611 2.387 4.294 5.682 4.732 9.267a15.284 15.284 0 01-2.352 10.2c-1.954 2.99-4.89 5.136-8.26 6.036zM50 35.166c1.894 0 3.71-.782 5.05-2.173a7.566 7.566 0 002.09-5.245 7.566 7.566 0 00-2.09-5.244A7.009 7.009 0 0050 20.33c-1.894 0-3.71.782-5.05 2.173a7.566 7.566 0 00-2.09 5.244c0 1.968.752 3.854 2.09 5.245A7.009 7.009 0 0050 35.166z"
              fill="#3D7BCE"
            />
          </g>
        </g>
        <defs>
          <clipPath id="prefix__clip0_1038_47448">
            <rect width={100} height={100} rx={8} fill="#fff" />
          </clipPath>
          <filter
            id="prefix__filter0_d_1038_47448"
            x={2.296}
            y={6.914}
            width={95.408}
            height={98.172}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy={6} />
            <feGaussianBlur stdDeviation={6} />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1038_47448"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1038_47448"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function DistributedKeygenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="text-[50px] md:text-[100px]">
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className={twMerge(
          'shadow-[0_4px_4px_0_rgba(0,0,0,0.25),-32px_-32px_72px_0_rgba(224,220,250,1)] rounded-lg',
          props.className
        )}
      >
        <rect width={100} height={100} rx={8} fill="#F6F4FF" />
        <g filter="url(#prefix__filter0_d_1038_47450)">
          <path
            d="M37.119 41.288L61.106 14.52l4.822 4.322-4.321 4.825 8.436 7.56-4.32 4.825-8.44-7.563-4.322 4.822 7.233 6.482-4.321 4.825-7.233-6.485-6.699 7.475a16.196 16.196 0 01-23.806 21.714 16.19 16.19 0 0118.984-26.035zm-.945 20.458a9.714 9.714 0 10-14.463-12.96 9.714 9.714 0 0014.466 12.963l-.003-.003z"
            fill="#624FBE"
          />
        </g>
        <g filter="url(#prefix__filter1_d_1038_47450)">
          <path
            d="M50.512 55.87l31.126-17.971 3.238 5.607-5.608 3.24 5.664 9.811-5.608 3.241-5.667-9.815-5.607 3.238 4.856 8.41-5.608 3.241-4.856-8.414-8.692 5.019a16.197 16.197 0 01-29.383 13.225A16.19 16.19 0 0150.512 55.87zm-7.266 19.147a9.715 9.715 0 001.239-16.291 9.714 9.714 0 00-10.949-.527 9.714 9.714 0 009.712 16.822l-.002-.004z"
            fill="#4B3AA4"
          />
        </g>
        <defs>
          <filter
            id="prefix__filter0_d_1038_47450"
            x={8.727}
            y={14.521}
            width={65.316}
            height={64.913}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy={4} />
            <feGaussianBlur stdDeviation={2} />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1038_47450"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1038_47450"
              result="shape"
            />
          </filter>
          <filter
            id="prefix__filter1_d_1038_47450"
            x={18.183}
            y={37.898}
            width={70.749}
            height={52.873}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy={4} />
            <feGaussianBlur stdDeviation={2} />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1038_47450"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1038_47450"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function ZkMessagingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="text-[50px] md:text-[100px]">
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 101 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className={twMerge(
          'shadow-[0_4px_4px_0_rgba(0,0,0,0.25),-32px_-32px_72px_0_rgba(206,241,210,1)] rounded-lg',
          props.className
        )}
      >
        <g clipPath="url(#prefix__clip0_1038_47453)">
          <rect
            x={0.376}
            y={0.689}
            width={100}
            height={100}
            rx={8}
            fill="#EBFFF0"
          />
          <g filter="url(#prefix__filter0_d_1038_47453)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M33.46 75.286c-6.648-5.09-10.935-13.11-10.935-22.13 0-15.382 12.47-27.852 27.853-27.852 15.383 0 27.854 12.47 27.854 27.853 0 9.3-4.559 17.537-11.564 22.596l47.208 235.365h-127L33.461 75.286z"
              fill="#85DC8E"
            />
          </g>
          <g filter="url(#prefix__filter1_d_1038_47453)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M47.475 29.71h5.802l.07.364C64.502 31.53 73.116 41.07 73.116 52.621c0 8.499-4.662 15.908-11.568 19.811l33.664 173.873H5.537L39.203 72.432c-6.905-3.904-11.567-11.313-11.567-19.81 0-11.552 8.614-21.092 19.768-22.548l.07-.364z"
              fill="#288E32"
            />
          </g>
          <g filter="url(#prefix__filter2_d_1038_47453)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M45.3 68.973C38.942 66.85 34.36 60.85 34.36 53.777c0-8.846 7.171-16.017 16.017-16.017s16.018 7.17 16.018 16.017c0 7.073-4.584 13.075-10.944 15.197l5.35 32.906H39.95l5.35-32.907z"
              fill="#01550A"
            />
          </g>
        </g>
        <defs>
          <filter
            id="prefix__filter0_d_1038_47453"
            x={-25.124}
            y={19.303}
            width={151}
            height={309.814}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy={6} />
            <feGaussianBlur stdDeviation={6} />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1038_47453"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1038_47453"
              result="shape"
            />
          </filter>
          <filter
            id="prefix__filter1_d_1038_47453"
            x={-6.463}
            y={23.71}
            width={113.675}
            height={240.595}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy={6} />
            <feGaussianBlur stdDeviation={6} />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1038_47453"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1038_47453"
              result="shape"
            />
          </filter>
          <filter
            id="prefix__filter2_d_1038_47453"
            x={22.359}
            y={31.76}
            width={56.035}
            height={88.121}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy={6} />
            <feGaussianBlur stdDeviation={6} />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1038_47453"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1038_47453"
              result="shape"
            />
          </filter>
          <clipPath id="prefix__clip0_1038_47453">
            <rect
              x={0.376}
              y={0.689}
              width={100}
              height={100}
              rx={8}
              fill="#fff"
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
