import cx from 'classnames';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ArrowRight } from '@webb-tools/icons';

type Extension = {
  value: string;
  title: string;
  description: string;
  bgClass: string;
};

const extensions: Array<Extension> = [
  {
    value: 'identity',
    title: 'Identity VAnchor',
    description:
      'A shielded pool protocol that supports multiple types of assets now in development.',
    bgClass:
      "bg-[linear-gradient(171.8deg,#FBEEF7_44.92%,rgba(251,238,247,0)_70.41%),url('/static/assets/good-pink.png')]",
  },
  {
    value: 'multi-asset',
    title: 'Multi-Asset VAnchor',
    description:
      ' A shielded pool protocol where transactors must prove the existence of an identity in a shielded identity protocol in order to transact.',
    bgClass: "bg-[url('/static/assets/multiasset-vanchor.png')]",
  },
  {
    value: 'chainalysisSanctioned',
    title: 'Chainalysis Sanctioned VAnchor',
    description:
      'A shielded pool protocol that ensures depositors aren’t on the United States’ OFAC sanctions list.',
    bgClass:
      "bg-[linear-gradient(171.8deg,#DEFFE6_44.92%,rgba(222,255,230,0)_70.41%),url('/static/assets/green.png')]",
  },
];

export const ShieldedPoolExtensionsSection = () => {
  return (
    <section className="py-[64px] md:py-[156px] px-4 lg:px-0">
      <div className="max-w-[900px] mx-auto flex flex-col">
        <Typography
          variant="mkt-h3"
          className={cx(
            'text-center text-mono-200 font-black mb-6',
            '!text-[36px] !leading-[48px] md:!text-[48px] md:!leading-[60px]'
          )}
        >
          Extensions
        </Typography>

        <Typography
          variant="mkt-body1"
          fw="medium"
          className="md:text-[24px] md:leading-[40px] text-center text-mono-140"
        >
          We’re building out extensions to expand the capacity and functionality
          of shielded pool protocols. Collaborate with us to help build more!
        </Typography>

        <TabsRoot
          defaultValue={extensions[0].value}
          className={cx(
            'max-w-[900px] mx-auto mt-9',
            'flex flex-col md:flex-row gap-6 items-center'
          )}
        >
          <div className="w-full md:w-auto flex-[1]">
            <TabsList className="flex-col space-x-0 gap-2">
              {extensions.map((extension, idx) => (
                <TabTrigger
                  key={idx}
                  isDisableStyle
                  className={cx(
                    'w-full bg-inherit py-2 px-4 rounded-lg',
                    'flex justify-between items-center',
                    'radix-state-active:bg-[#ECF4FF] radix-state-active:text-blue-70'
                  )}
                  value={extension.value}
                >
                  <Typography
                    variant="mkt-body2"
                    fw="black"
                    className="text-current"
                  >
                    {extension.title}
                  </Typography>
                  <ArrowRight className="!fill-current" size="lg" />
                </TabTrigger>
              ))}
            </TabsList>

            <Typography
              variant="mkt-body1"
              fw="medium"
              className="hidden md:block text-mono-140 mt-9"
            >
              We&apos;re revolutionizing shielded pool protocols by developing
              powerful extensions. Partner with us to create cutting-edge
              solutions & begin building with our innovative extensions.
            </Typography>
          </div>

          <div className="flex-[1]">
            {extensions.map((extension, idx) => (
              <TabContent
                key={idx}
                value={extension.value}
                className={cx(
                  'w-full aspect-square rounded-lg overflow-hidden relative isolate',
                  'bg-center bg-cover',
                  'p-4 md:p-9',
                  extension.bgClass
                )}
              >
                <Typography variant="mkt-body2" fw="black" className="mb-6">
                  {extension.title}
                </Typography>
                <Typography variant="mkt-body1" fw="medium">
                  {extension.description}
                </Typography>
              </TabContent>
            ))}
          </div>
        </TabsRoot>
      </div>
    </section>
  );
};
