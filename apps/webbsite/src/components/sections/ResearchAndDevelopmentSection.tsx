import { Button } from '@webb-tools/webb-ui-components';
import React, { Fragment } from 'react';
import Heading2 from '../Heading2';
import Heading3 from '../Heading3';
import SubHeading from '../SubHeading';
import SubHeading2 from '../SubHeading2';
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
    sourceCodeUrl: 'https://github.com/webb-tools',
    documentationUrl: 'https://docs.webb.tools/v1/anchor-system/overview/',
  },
  {
    icon: <DistributedKeygenIcon />,
    title: 'Distributed Key Generation Protocols',
    description:
      'We leverage multi-party computation protocols used to decentralize trust over a set of parties to facilitate governance and operation of Anchor Protocol instances.',
    sourceCodeUrl: 'https://webb-tools.github.io/dkg-substrate/',
    documentationUrl: 'https://docs.webb.tools/v1/dkg/overview/',
  },
  {
    icon: <ZkMessagingIcon />,
    title: 'Zero-knowledge Messaging',
    description:
      'The message schema and circuits that enable zero-knowledge proofs of membership and property testing for assets, identities, and data.',
    sourceCodeUrl: 'https://github.com/webb-tools/zero-knowledge-gadgets',
    documentationUrl: 'https://docs.webb.tools',
  },
];

const ResearchAndDevelopmentSection = () => {
  return (
    <section className="relative overflow-x-hidden py-16 md:py-[156px] flex items-center justify-center w-full">
      <div className="max-w-[900px] z-10">
        <Heading2 className="px-4 text-center">Research & Development</Heading2>

        <SubHeading className="mt-6 px-4 text-center mx-auto max-w-[773px]">
          Building interoperable zero-knowledge applications to scale privacy
          for all users in the Web3 ecosystem.
        </SubHeading>

        <div className="space-y-4 mt-9">
          {sections.map((section, idx) => (
            <div key={`${section.title}-${idx}`} className="flex space-x-6 p-9">
              <div className="text-[50px] md:text-[100px]">{section.icon}</div>

              <div>
                <Heading3>{section.title}</Heading3>
                <SubHeading2 className="mt-2 text-mono-160">
                  {section.description}
                </SubHeading2>

                <div className="flex mt-6 space-x-2">
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

export default ResearchAndDevelopmentSection;

function AnchorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="relative text-[50px] md:text-[100px] w-[50px] md:w-[100px]">
      <svg
        width="1.5em"
        height="1.5em"
        viewBox="0 0 138 144"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-0 -z-10"
      >
        <ellipse
          cx={68.508}
          cy={72.096}
          rx={68.508}
          ry={71.904}
          fill="#9BC5FC"
        />
      </svg>

      {/** Blur layer */}
      <div className="absolute w-screen h-64 -translate-x-32 -translate-y-1/3 -z-[1] inset-0 backdrop-blur-2xl" />

      <svg
        width="1em"
        height="1em"
        viewBox="0 0 116 116"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className={twMerge('absolute z-10', props.className)}
      >
        <g filter="url(#prefix__filter0_d_1033_35853)">
          <g clipPath="url(#prefix__clip0_1033_35853)">
            <rect x={8} y={4} width={100} height={100} rx={8} fill="#ECF4FF" />
            <g filter="url(#prefix__filter1_d_1033_35853)">
              <path
                d="M61.57 46.116v37.286c12.922-1.68 23.162-12.372 24.772-25.856h-10.49l13.225-22.089a38.366 38.366 0 014.627 18.358c0 20.583-15.985 37.272-35.704 37.272-19.72 0-35.704-16.69-35.704-37.272 0-6.676 1.682-12.94 4.627-18.358l13.225 22.089h-10.49c1.61 13.484 11.854 24.176 24.772 25.856V46.116c-3.358-.912-6.282-3.061-8.226-6.048a15.293 15.293 0 01-2.337-10.182c.437-3.576 2.113-6.865 4.713-9.252 2.601-2.387 5.95-3.71 9.42-3.72 3.479-.004 6.839 1.312 9.45 3.699 2.611 2.387 4.294 5.682 4.732 9.267a15.284 15.284 0 01-2.352 10.2c-1.954 2.99-4.89 5.136-8.26 6.036zM58 39.166c1.894 0 3.71-.782 5.05-2.173a7.566 7.566 0 002.09-5.245 7.566 7.566 0 00-2.09-5.244A7.009 7.009 0 0058 24.33c-1.894 0-3.71.782-5.05 2.173a7.566 7.566 0 00-2.09 5.244c0 1.968.752 3.854 2.09 5.245A7.009 7.009 0 0058 39.166z"
                fill="#3D7BCE"
              />
            </g>
          </g>
        </g>
        <defs>
          <filter
            id="prefix__filter0_d_1033_35853"
            x={0}
            y={0}
            width={116}
            height={116}
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
            <feGaussianBlur stdDeviation={4} />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1033_35853"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1033_35853"
              result="shape"
            />
          </filter>
          <filter
            id="prefix__filter1_d_1033_35853"
            x={10.296}
            y={10.914}
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
              result="effect1_dropShadow_1033_35853"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1033_35853"
              result="shape"
            />
          </filter>
          <clipPath id="prefix__clip0_1033_35853">
            <rect x={8} y={4} width={100} height={100} rx={8} fill="#fff" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function DistributedKeygenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="relative text-[50px] md:text-[100px] w-[50px] md:w-[100px]">
      <svg
        width="1.5em"
        height="1.5em"
        viewBox="0 0 138 144"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-0 -z-10 -translate-y-1/3"
      >
        <ellipse
          cx="68.5078"
          cy="72.0962"
          rx="68.5078"
          ry="71.9038"
          fill="#B5A9F2"
        />
      </svg>

      {/** Blur layer */}
      <div className="absolute w-screen h-64 -translate-x-32 -translate-y-1/3 -z-[1] inset-0 backdrop-blur-2xl" />

      <svg
        width="1em"
        height="1em"
        viewBox="0 0 108 108"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className={twMerge('absolute z-10', props.className)}
      >
        <g filter="url(#prefix__filter0_d_1033_35864)">
          <rect x={4} width={100} height={100} rx={8} fill="#F6F4FF" />
          <g filter="url(#prefix__filter1_d_1033_35864)">
            <path
              d="M41.119 41.288L65.106 14.52l4.822 4.322-4.321 4.825 8.436 7.56-4.32 4.825-8.44-7.563-4.322 4.822 7.233 6.482-4.321 4.825-7.233-6.485-6.699 7.475a16.196 16.196 0 01-23.806 21.714 16.19 16.19 0 0118.984-26.035zm-.945 20.458a9.714 9.714 0 10-14.463-12.96 9.714 9.714 0 0014.466 12.963l-.003-.003z"
              fill="#624FBE"
            />
          </g>
          <g filter="url(#prefix__filter2_d_1033_35864)">
            <path
              d="M54.512 55.87l31.126-17.971 3.238 5.607-5.608 3.24 5.664 9.811-5.608 3.241-5.667-9.815-5.607 3.238 4.856 8.41-5.608 3.241-4.856-8.414-8.692 5.019a16.197 16.197 0 01-29.383 13.225A16.19 16.19 0 0154.512 55.87zm-7.266 19.147a9.715 9.715 0 001.239-16.291 9.714 9.714 0 00-10.949-.527 9.714 9.714 0 009.712 16.822l-.002-.004z"
              fill="#4B3AA4"
            />
          </g>
        </g>
        <defs>
          <filter
            id="prefix__filter0_d_1033_35864"
            x={0}
            y={0}
            width={108}
            height={108}
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
              result="effect1_dropShadow_1033_35864"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1033_35864"
              result="shape"
            />
          </filter>
          <filter
            id="prefix__filter1_d_1033_35864"
            x={12.727}
            y={14.521}
            width={65.316}
            height={64.914}
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
              result="effect1_dropShadow_1033_35864"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1033_35864"
              result="shape"
            />
          </filter>
          <filter
            id="prefix__filter2_d_1033_35864"
            x={22.183}
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
              result="effect1_dropShadow_1033_35864"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1033_35864"
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
    <div className="relative text-[50px] md:text-[100px] w-[50px] md:w-[100px]">
      <svg
        width="1.5em"
        height="1.5em"
        viewBox="0 0 138 144"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -z-10 right-1/4 top-1/4"
      >
        <ellipse
          cx="68.5078"
          cy="72.0962"
          rx="68.5078"
          ry="71.9038"
          fill="#85DC8E"
        />
      </svg>

      {/** Blur layer */}
      <div className="absolute w-screen h-64 -translate-x-32 -translate-y-12 -z-[1] inset-0 backdrop-blur-2xl" />

      <svg
        width="1em"
        height="1em"
        viewBox="0 0 108 108"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className={twMerge('absolute z-10', props.className)}
      >
        <g filter="url(#prefix__filter0_d_1033_35876)">
          <g clipPath="url(#prefix__clip0_1033_35876)">
            <rect x={4} width={100} height={100} rx={8} fill="#EBFFF0" />
            <g filter="url(#prefix__filter1_d_1033_35876)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M37.085 74.596c-6.649-5.09-10.936-13.108-10.936-22.128 0-15.383 12.47-27.854 27.853-27.854 15.383 0 27.854 12.47 27.854 27.854 0 9.3-4.559 17.536-11.564 22.595L117.5 310.43h-127L37.085 74.596z"
                fill="#85DC8E"
              />
            </g>
            <g filter="url(#prefix__filter2_d_1033_35876)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M51.099 29.02H56.9l.07.365C68.126 30.84 76.74 40.38 76.74 51.932c0 8.498-4.662 15.908-11.568 19.81l33.664 173.874H9.16L42.827 71.742C35.922 67.84 31.26 60.43 31.26 51.932c0-11.551 8.614-21.091 19.768-22.547l.07-.365z"
                fill="#288E32"
              />
            </g>
            <g filter="url(#prefix__filter3_d_1033_35876)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.924 68.284c-6.358-2.123-10.94-8.124-10.94-15.196 0-8.846 7.17-16.017 16.016-16.017 8.846 0 16.018 7.17 16.018 16.017 0 7.072-4.584 13.074-10.943 15.197l5.35 32.906H43.574l5.35-32.907z"
                fill="#01550A"
              />
            </g>
          </g>
        </g>
        <defs>
          <filter
            id="prefix__filter0_d_1033_35876"
            x={0}
            y={0}
            width={108}
            height={108}
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
              result="effect1_dropShadow_1033_35876"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1033_35876"
              result="shape"
            />
          </filter>
          <filter
            id="prefix__filter1_d_1033_35876"
            x={-21.5}
            y={18.614}
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
              result="effect1_dropShadow_1033_35876"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1033_35876"
              result="shape"
            />
          </filter>
          <filter
            id="prefix__filter2_d_1033_35876"
            x={-2.839}
            y={23.02}
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
              result="effect1_dropShadow_1033_35876"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1033_35876"
              result="shape"
            />
          </filter>
          <filter
            id="prefix__filter3_d_1033_35876"
            x={25.983}
            y={31.071}
            width={56.034}
            height={88.12}
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
              result="effect1_dropShadow_1033_35876"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_1033_35876"
              result="shape"
            />
          </filter>
          <clipPath id="prefix__clip0_1033_35876">
            <rect x={4} width={100} height={100} rx={8} fill="#fff" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
