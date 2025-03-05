import { FC, useState, useEffect } from 'react';
import { Card, Typography } from '@tangle-network/ui-components';
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
              <Typography
                variant="body1"
                className="text-lg text-mono-180 dark:text-mono-40"
              >
                {slide.description}
              </Typography>
              <div>
                <ul className="list-disc list-inside">
                  {slide.bulletPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="text-lg text-mono-180 dark:text-mono-40"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={slide.btnLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-blue-70 dark:text-blue-40 mt-auto flex items-center gap-1 w-fit"
              >
                {slide.btnText}

                <ArrowRightUp className="w-5 h-5 fill-blue-70 dark:fill-blue-40" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex gap-3 bottom-5">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 rounded-full transition-all ${
              currentSlide === index
                ? 'bg-mono-140 dark:bg-mono-0 w-6'
                : 'bg-mono-140/70 dark:bg-mono-0/70 hover:bg-mono-140/90 dark:hover:bg-mono-0/90 w-3'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </Card>
  );
};

export default PromotionalBanner;
