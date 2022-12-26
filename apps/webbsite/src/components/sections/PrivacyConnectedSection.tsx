import { ChainIcon } from '@webb-tools/icons';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
} from '@webb-tools/webb-ui-components/components/Tabs';

import { Transition } from '@headlessui/react';
import { FC, useState } from 'react';
import Heading2 from '../Heading2';
import SubHeading from '../SubHeading';

const tabsContent = {
  ownership: {
    animationUrl: '/animations/deposit.json',
    title: 'Proof of Ownership',
  },
  identity: {
    animationUrl: '/animations/kyc.json',
    title: 'Proof of Identity',
  },
  privacy: {
    animationUrl: '/animations/ecosystem.json',
    title: 'Privacy Ecosystems',
  },
};

type TabTypes = 'ownership' | 'identity' | 'privacy';

const PrivacyConnectedSection = () => {
  // State for the selected tab
  const [activeTab, setActiveTab] = useState<TabTypes>('ownership');

  return (
    <section className="max-w-[932px] mx-auto pb-4 md:pb-[156px] flex flex-col justify-center w-full">
      <ChainIcon name="tangle" className="mx-auto w-7 h-7" />
      <Heading2 className="mt-6 text-center">
        The Future of privacy is Connected
      </Heading2>
      <SubHeading className="mt-6 text-center md:mt-9">
        Connecting private applications across chains allows us to scale the
        size of privacy sets to encompass all the users and data possible in our
        Web3 ecosystem.
      </SubHeading>

      <TabsRoot
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={(nextTab) => setActiveTab(nextTab as TabTypes)}
        className="p-4 space-y-4 rounded-lg shadow-md mt-9 bg-mono-0"
      >
        <TabsList aria-label="tabs" className="mb-4">
          {Object.entries(tabsContent).map(([key, value]) => (
            <TabTrigger key={key} value={key}>
              {value.title}
            </TabTrigger>
          ))}
        </TabsList>

        {/* Tabs content */}
        {Object.entries(tabsContent).map(([key, value]) => (
          <Transition
            appear
            show={key === activeTab}
            enter="transition-opacity duration-[1000]"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-[1000]"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            key={key}
          >
            <TabContent className="lg:w-[900px] h-[340px]" value={key}>
              <div className="hidden lg:block">
                <LottiePlayer animationUrl={value.animationUrl} />
              </div>

              <div className="text-[214px] flex items-center justify-center h-full lg:hidden">
                <Pool />
              </div>
            </TabContent>
          </Transition>
        ))}
      </TabsRoot>
    </section>
  );
};

export default PrivacyConnectedSection;

const LottiePlayer: FC<{ animationUrl: string }> = ({ animationUrl }) => {
  return (
    <lottie-player
      src={animationUrl}
      autoplay
      speed={0.8}
      loop
      style={{ height: '100%', width: '100%' }}
    />
  );
};

function Pool(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 212 214"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#prefix__filter0_d_1010_33823)">
        <rect
          x={4.038}
          y={0.482}
          width={203.844}
          height={204.797}
          rx={8}
          fill="#3D7BCE"
        />
        <rect
          x={33.169}
          y={29.75}
          width={145.581}
          height={146.261}
          rx={8}
          fill="#2B2F40"
        />
        <path d="M98.854 146.419l-28.055-43.172" stroke="#ECF4FF" />
        <path
          d="M190.381 8.059v8.872l7.499 3.35-7.499-12.222z"
          fill="#F7F8F7"
        />
        <path d="M190.381 8.059l-7.5 12.222 7.5-3.35V8.059z" fill="#fff" />
        <path
          d="M190.381 26.03v6.029l7.504-10.381-7.504 4.353z"
          fill="#F7F8F7"
        />
        <path d="M190.381 32.059v-6.03l-7.5-4.351 7.5 10.38z" fill="#fff" />
        <path
          d="M190.381 24.635l7.499-4.354-7.499-3.348v7.702z"
          fill="#E2E5EB"
        />
        <path d="M182.881 20.281l7.5 4.354v-7.702l-7.5 3.348z" fill="#F7F8F7" />
        <path
          d="M62.631 146.062l-8.168-16.412M79.323 146.419l8.168-15.342M44.519 146.775l61.792-104.182 61.083 104.182"
          stroke="#ECF4FF"
        />
        <ellipse
          cx={70.087}
          cy={103.247}
          rx={5.682}
          ry={5.709}
          fill="#5093ED"
        />
        <ellipse
          cx={142.535}
          cy={103.247}
          rx={5.682}
          ry={5.709}
          fill="#ECF4FF"
        />
        <ellipse
          cx={54.463}
          cy={130.363}
          rx={5.682}
          ry={5.709}
          fill="#81B3F6"
        />
        <ellipse
          cx={88.199}
          cy={130.363}
          rx={5.682}
          ry={5.709}
          fill="#81B3F6"
        />
        <ellipse
          cx={124.779}
          cy={130.363}
          rx={5.682}
          ry={5.709}
          fill="#ECF4FF"
        />
        <ellipse
          cx={157.096}
          cy={130.363}
          rx={5.682}
          ry={5.709}
          fill="#ECF4FF"
        />
        <ellipse
          cx={45.229}
          cy={145.348}
          rx={5.682}
          ry={5.709}
          fill="#B8D6FF"
        />
        <ellipse
          cx={63.229}
          cy={145.348}
          rx={5.682}
          ry={5.709}
          fill="#B8D6FF"
        />
        <ellipse
          cx={79.743}
          cy={145.348}
          rx={5.682}
          ry={5.709}
          fill="#B8D6FF"
        />
        <ellipse
          cx={98.499}
          cy={145.348}
          rx={5.682}
          ry={5.709}
          fill="#B8D6FF"
        />
        <ellipse
          cx={116.256}
          cy={145.348}
          rx={5.682}
          ry={5.709}
          fill="#ECF4FF"
        />
        <ellipse
          cx={132.591}
          cy={145.348}
          rx={5.682}
          ry={5.709}
          fill="#ECF4FF"
        />
        <ellipse
          cx={148.926}
          cy={145.348}
          rx={5.682}
          ry={5.709}
          fill="#ECF4FF"
        />
        <ellipse
          cx={166.683}
          cy={145.348}
          rx={5.682}
          ry={5.709}
          fill="#ECF4FF"
        />
        <path
          d="M115.901 146.062l26.279-42.101M133.124 146.418l-8.168-16.412M148.218 146.419l8.168-15.342"
          stroke="#ECF4FF"
        />
        <path
          d="M44.732 48.215c-.818 0-1.456-.221-1.914-.664-.459-.448-.688-1.076-.688-1.883 0-.875.271-1.539.813-1.992.547-.458 1.362-.695 2.445-.71l1.742-.032v-.43c0-.536-.09-.943-.273-1.219-.182-.276-.477-.414-.883-.414-.38 0-.661.097-.844.29-.177.187-.286.489-.328.906l-2.289-.11c.281-1.672 1.466-2.508 3.555-2.508 1.052 0 1.857.258 2.414.774.562.516.844 1.273.844 2.273v3.063c0 .474.052.802.156.984.11.177.289.266.539.266.166 0 .328-.016.484-.047v1.188c-.13.03-.247.06-.351.085a3.322 3.322 0 01-.313.063 4.569 4.569 0 01-.742.055c-.552 0-.96-.136-1.227-.407-.26-.27-.416-.669-.468-1.195h-.047c-.328.589-.703 1.013-1.125 1.273-.417.26-.917.391-1.5.391zm2.398-4.07l-1.047.015c-.468.01-.81.06-1.023.149a.929.929 0 00-.477.414c-.109.187-.164.445-.164.773 0 .792.313 1.188.938 1.188.505 0 .927-.198 1.265-.594.339-.401.508-.906.508-1.516v-.43z"
          fill="#fff"
        />
        <rect
          x={4.038}
          y={0.482}
          width={203.844}
          height={204.797}
          rx={8}
          fill="#F7F8F7"
        />
        <path
          d="M190.381 8.059v8.872l7.499 3.35-7.499-12.222z"
          fill="#5C97E4"
        />
        <path d="M190.381 8.059l-7.5 12.222 7.5-3.35V8.059z" fill="#3D7BCE" />
        <path
          d="M190.381 26.03v6.029l7.504-10.381-7.504 4.353z"
          fill="#5C97E4"
        />
        <path d="M190.381 32.059v-6.03l-7.5-4.351 7.5 10.38z" fill="#3D7BCE" />
        <path
          d="M190.381 24.635l7.499-4.354-7.499-3.348v7.702z"
          fill="#83B7FC"
        />
        <path d="M182.881 20.281l7.5 4.354v-7.702l-7.5 3.348z" fill="#5C97E4" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.914 30.188c6.768 0 12.255-5.487 12.255-12.255 0-6.768-5.487-12.255-12.255-12.255-6.769 0-12.255 5.487-12.255 12.255 0 6.768 5.486 12.255 12.255 12.255zm-3.572-8.998c-.73 0-1.328-.172-1.794-.515-.46-.35-.69-.846-.69-1.49 0-.135.016-.3.046-.497.08-.441.193-.972.34-1.591.418-1.687 1.494-2.53 3.229-2.53.472 0 .895.08 1.27.24.373.153.668.386.882.699.215.306.322.674.322 1.103 0 .13-.015.292-.046.488a20.83 20.83 0 01-.33 1.591c-.216.84-.586 1.469-1.114 1.886-.527.41-1.232.616-2.115.616zm.128-1.325c.344 0 .635-.1.874-.303.245-.203.42-.512.524-.93.142-.576.249-1.078.323-1.508.024-.128.036-.26.036-.395 0-.558-.291-.837-.873-.837-.344 0-.638.101-.884.303-.239.203-.41.512-.515.93-.11.41-.22.913-.33 1.508a1.968 1.968 0 00-.038.386c0 .564.295.846.883.846zm3.743 1.169a.195.195 0 00.157.064h1.25a.28.28 0 00.175-.064.264.264 0 00.101-.166l.424-2.014h1.241c.803 0 1.435-.169 1.895-.506.466-.337.776-.859.929-1.564.037-.165.055-.325.055-.478 0-.534-.208-.941-.625-1.224-.411-.282-.957-.423-1.638-.423h-2.446a.28.28 0 00-.175.065.263.263 0 00-.101.165l-1.27 5.979a.22.22 0 00.028.166zm4.084-3.661c-.19.14-.414.211-.671.211h-1.058l.35-1.646h1.103c.252 0 .43.049.534.147.104.092.156.227.156.405 0 .08-.01.171-.028.276a.993.993 0 01-.386.607z"
          fill="#EF570D"
        />
        <path
          d="M36.17 185.923v5.426a1.959 1.959 0 01-.96 1.674l-4.684 2.707a1.864 1.864 0 01-1.918 0l-4.684-2.707a1.957 1.957 0 01-.96-1.674v-1.523l2.399-1.397v2.648l4.196 2.444 4.197-2.444v-4.878l-4.197-2.444-9.832 5.716a1.945 1.945 0 01-1.918 0l-4.684-2.719a1.953 1.953 0 01-.937-1.671v-5.426a1.959 1.959 0 01.96-1.674l4.683-2.707a1.884 1.884 0 011.919 0l4.683 2.707a1.956 1.956 0 01.96 1.674v1.523l-2.413 1.387v-2.632l-4.197-2.444-4.197 2.444v4.871l4.197 2.445 9.832-5.716a1.945 1.945 0 011.919 0l4.684 2.719a1.961 1.961 0 01.952 1.671z"
          fill="#624FBE"
        />
        <path
          d="M186.63 180.046c2.392 0 4.33-1.127 4.33-2.517 0-1.391-1.938-2.518-4.33-2.518-2.391 0-4.33 1.127-4.33 2.518 0 1.39 1.939 2.517 4.33 2.517zM186.63 199.011c2.392 0 4.33-1.126 4.33-2.517 0-1.39-1.938-2.517-4.33-2.517-2.391 0-4.33 1.127-4.33 2.517 0 1.391 1.939 2.517 4.33 2.517zM180.597 183.53c1.196-2.07 1.188-4.312-.017-5.008-1.206-.695-3.152.419-4.348 2.489-1.196 2.07-1.188 4.312.017 5.007 1.206.696 3.152-.418 4.348-2.488zM197.029 193.012c1.195-2.07 1.188-4.312-.016-5.007-1.205-.695-3.151.42-4.346 2.49-1.196 2.07-1.189 4.311.015 5.006 1.205.695 3.151-.419 4.347-2.489zM180.58 195.5c1.205-.695 1.213-2.937.017-5.007-1.196-2.07-3.142-3.184-4.348-2.489-1.205.696-1.213 2.938-.017 5.008 1.196 2.07 3.142 3.184 4.348 2.488zM197.013 186.019c1.204-.695 1.211-2.936.015-5.006-1.195-2.07-3.141-3.185-4.346-2.49-1.204.695-1.211 2.937-.015 5.007 1.195 2.07 3.141 3.184 4.346 2.489z"
          fill="#ED26D9"
        />
        <path
          d="M47.038 184.076h118M47.038 20.282h118M190.381 44.247v118M175.34 36.846L41.111 171.075M175.34 171.075L41.111 36.846M21.915 44.247v118"
          stroke="#C2C8D4"
        />
        <g filter="url(#prefix__filter1_bd_1010_33823)">
          <circle
            cx={108.442}
            cy={102.881}
            r={45.81}
            fill="#fff"
            fillOpacity={0.5}
            shapeRendering="crispEdges"
          />
        </g>
        <path
          d="M94.778 88.947l13.448-2.989 13.448 2.989a1.637 1.637 0 011.281 1.597v16.345a9.816 9.816 0 01-4.373 8.17l-10.356 6.904-10.356-6.904a9.82 9.82 0 01-4.373-8.169V90.544a1.636 1.636 0 011.281-1.597zm1.992 2.91v15.032a6.546 6.546 0 002.915 5.446l8.541 5.696 8.541-5.696a6.536 6.536 0 002.915-5.445V91.856l-11.456-2.543-11.456 2.543z"
          fill="#1F1D2B"
        />
      </g>
      <defs>
        <filter
          id="prefix__filter0_d_1010_33823"
          x={0.038}
          y={0.482}
          width={211.844}
          height={212.797}
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
            result="effect1_dropShadow_1010_33823"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_1010_33823"
            result="shape"
          />
        </filter>
        <filter
          id="prefix__filter1_bd_1010_33823"
          x={58.631}
          y={53.07}
          width={99.621}
          height={103.621}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation={2} />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_1010_33823"
          />
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
            in2="effect1_backgroundBlur_1010_33823"
            result="effect2_dropShadow_1010_33823"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect2_dropShadow_1010_33823"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
