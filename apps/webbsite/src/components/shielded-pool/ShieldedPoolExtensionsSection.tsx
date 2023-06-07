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
    bgClass:
      "bg-[linear-gradient(171.8deg,#FEC6C1_38.29%,rgba(254,198,193,0)_70.41%),url('/static/assets/cool.png')]",
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
      <div className="max-w-[900px] mx-auto flex flex-col gap-6 md:gap-[70px]">
        <Typography
          variant="mkt-h3"
          className={cx(
            'text-center text-mono-200 font-black',
            '!text-[36px] !leading-[48px] md:!text-[48px] md:!leading-[60px]'
          )}
        >
          Extensions
        </Typography>

        <TabsRoot
          defaultValue={extensions[0].value}
          className={cx(
            'max-w-[900px] mx-auto',
            'flex flex-col md:flex-row gap-6 items-center'
          )}
        >
          <div className="flex-[1]">
            <Typography
              variant="mkt-body1"
              className="text-center md:text-left text-mono-140 font-semibold mb-9"
            >
              We&apos;re revolutionizing shielded pool protocols by developing
              powerful extensions. Partner with us to create cutting-edge
              solutions & begin building with our innovative extensions.
            </Typography>

            <TabsList className="flex-col space-x-0 gap-2">
              {extensions.map((extension, idx) => (
                <TabTrigger
                  key={idx}
                  isDisableStyle
                  className={cx(
                    'w-full flex py-2 px-4 justify-between items-center rounded-lg bg-mono-0',
                    'disabled:bg-blue-0 disabled:text-blue-70',
                    'radix-state-active:bg-blue-0 radix-state-active:text-blue-70'
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
          </div>
          <div className="flex-[1]">
            {extensions.map((extension, idx) => (
              <TabContent
                key={idx}
                value={extension.value}
                className={cx(
                  'w-full aspect-square rounded-lg overflow-hidden relative isolate',
                  'bg-center bg-cover',
                  'p-9',
                  extension.bgClass
                )}
              >
                <Typography variant="mkt-body2" fw="black" className="mb-6">
                  {extension.title}
                </Typography>
                <Typography variant="mkt-body1">
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
