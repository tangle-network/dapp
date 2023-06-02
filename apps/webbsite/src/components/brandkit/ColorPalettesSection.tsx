import { FC } from 'react';
import { Typography, Button } from '@webb-tools/webb-ui-components';
import { twMerge } from 'tailwind-merge';
import cx from 'classnames';

interface CircleColorProps {
  colorTop: string;
  colorBottom: string;
  className?: string;
  bordered?: boolean;
}

const circleColors = [
  {
    colorTop: '#3D7BCE',
    colorBottom: '#81B3F6',
  },
  {
    colorTop: '#624FBE',
    colorBottom: '#C6BBFA',
  },
  {
    colorTop: '#288E32',
    colorBottom: '#4CB457',
  },
  {
    colorTop: '#EAB612',
    colorBottom: '#F8D567',
  },
  {
    colorTop: '#EF570D',
    colorBottom: '#FF874D',
  },
  {
    colorTop: '#F7F8F7',
    colorBottom: '#1F1D2B',
  },
];

export const ColorPalettesSection = () => {
  return (
    <section className="dark bg-mono-200 w-full px-4 py-[96px] md:py-[150px]">
      <div className="max-w-[1440px] mx-auto space-y-6 md:space-y-8">
        <Typography
          variant="mkt-h3"
          className="font-black text-center dark:text-mono-0"
        >
          Color Palettes
        </Typography>

        <Typography
          variant="mkt-subheading"
          className="text-center dark:text-mono-60 md:max-w-[900px] mx-auto font-medium"
        >
          {
            "Below are the primary and secondary colors used in Webb's Ecosystem products. Download to view the entire spectrum of colors in Webb’s UI kit."
          }
        </Typography>

        <div className="flex justify-center gap-3 py-6 md:px-6 md:gap-6">
          {circleColors.map((item, i) => (
            <ColorCircle
              key={i}
              colorTop={item.colorTop}
              colorBottom={item.colorBottom}
              className="flex-[1] md:flex-none md:w-[80px]"
              bordered={
                item.colorTop === '#1F1D2B' || item.colorBottom === '#1F1D2B'
              }
            />
          ))}
        </div>

        <a
          href="/download/Webb-Color-Palettes.pdf.zip"
          download
          target="_blank"
          rel="noreferrer"
          className="block mx-auto w-fit"
        >
          <Button className="block mx-auto button-base button-primary">
            Download
          </Button>
        </a>
      </div>
    </section>
  );
};

const ColorCircle: FC<CircleColorProps> = ({
  colorTop,
  colorBottom,
  className,
  bordered = false,
}) => {
  const mergedClassName = twMerge(
    'aspect-square rounded-full',
    cx({ 'border border-mono-140': bordered }),
    className
  );

  return (
    <div
      className={mergedClassName}
      style={{
        background: `linear-gradient(to bottom, ${colorTop} 50%, ${colorBottom} 50%)`,
      }}
    />
  );
};
