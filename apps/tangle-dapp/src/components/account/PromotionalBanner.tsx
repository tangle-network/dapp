import { FC, useState, useEffect } from 'react';
import { Card, Typography } from '@tangle-network/webb-ui-components';
import { twMerge } from 'tailwind-merge';
import { ArrowRightUp } from '@tangle-network/icons';

interface CarouselSlide {
  title: string;
  description: string;
  bulletPoints: string[];
  btnText: string;
  btnLink: string;
}

const SLIDES: CarouselSlide[] = [
  {
    title: 'Earn Points with Tangle',
    description:
      'Join our ecosystem and earn rewards through network participation.',
    bulletPoints: [
      'Deposit and delegate restaking assets',
      'Build and deploy Blueprints',
      'Run a validator node or operate services',
    ],
    btnText: 'Get Started',
    btnLink: 'https://docs.tangle.tools/network/overview',
  },
  {
    title: 'Stake-to-Earn with Tangle',
    description: 'Secure the network while earning rewards through staking.',
    bulletPoints: [
      'Deposit restaking assets',
      'Delegate to operators',
      'Join liquid staking pools',
    ],
    btnText: 'Start Staking',
    btnLink: 'https://docs.tangle.tools/restake/introduction',
  },
  {
    title: 'Build the Future with Tangle',
    description: 'Create innovative services and earn rewards as a developer.',
    bulletPoints: [
      'Build Blueprints',
      'Develop network features',
      'Launch decentralized services',
    ],
    btnText: 'Start Building',
    btnLink: 'https://docs.tangle.tools/developers/blueprints/introduction',
  },
  {
    title: 'Run Infrastructure with Tangle',
    description: 'Power decentralized services and earn network rewards.',
    bulletPoints: [
      'Register as an operator',
      'Run validator nodes',
      'Operate Blueprint services',
    ],
    btnText: 'Learn How',
    btnLink: 'https://docs.tangle.tools/operators/introduction',
  },
];

const PromotionalBanner: FC<{ className?: string }> = ({ className }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card
      className={twMerge(
        'relative overflow-hidden bg-no-repeat bg-cover',
        "bg-[url('/static/assets/account/promotional_banner_light.png')] dark:bg-[url('/static/assets/account/promotional_banner_dark.png')]",
        className,
      )}
    >
      <div className="w-full overflow-hidden">
        <div
          className="flex w-full transition-transform duration-600 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide, index) => (
            <div
              key={index}
              className="w-full min-w-full flex-shrink-0 flex flex-col gap-[22px]"
            >
              <Typography variant="h4" fw="bold">
                {slide.title}
              </Typography>
              <Typography variant="body1">{slide.description}</Typography>
              <div>
                <ul className="list-disc list-inside">
                  {slide.bulletPoints.map((point, idx) => (
                    <li key={idx} className="text-mono-160 dark:text-mono-80">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={slide.btnLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[16px] font-bold text-blue-60 dark:text-blue-50 mt-auto flex items-center gap-1 w-fit"
              >
                {slide.btnText}

                <ArrowRightUp className="w-4 h-4 fill-blue-60 dark:fill-blue-50" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex gap-2 bottom-4">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index
                ? 'bg-white w-4'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </Card>
  );
};

export default PromotionalBanner;
