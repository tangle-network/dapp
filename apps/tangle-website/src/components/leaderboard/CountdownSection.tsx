import { FC } from 'react';
import cx from 'classnames';
import { Button, Typography } from '@webb-tools/webb-ui-components';

export const CountdownSection = () => {
  return (
    <div className="space-y-9">
      <div className="space-y-4">
        <Typography
          variant="mkt-small-caps"
          fw="black"
          className="text-center text-purple-70"
        >
          NOW LIVE
        </Typography>
        <Typography
          variant="mkt-h3"
          fw="black"
          className="text-center text-mono-200"
        >
          Tangle Testnet Leaderboard
        </Typography>
        <Typography
          variant="mkt-body2"
          fw="medium"
          className="text-center text-mono-140"
        >
          Our Tangle testnet leaderboard highlights top contributors, ranked by
          points earned through activities such as running validators, engaging
          in governance, crafting protocol extensions, transacting, and more!
        </Typography>
      </div>

      <div className="space-y-[32px]">
        <Typography
          variant="mkt-small-caps"
          fw="bold"
          className="text-center text-mono-200"
        >
          Time Remaining
        </Typography>
        <div className="flex justify-between md:justify-center gap-6 md:gap-12 px-4">
          <CountdownItem timeUnit="Days" />
          <CountdownItem timeUnit="Hours" />
          <CountdownItem timeUnit="Minutes" />
        </div>
      </div>

      <div className="space-y-4">
        <Typography
          variant="mkt-body2"
          fw="medium"
          className="text-center text-mono-140"
        >
          Unlock points and badges as you engage in the Tangle Network. Explore
          the guidelines or request points now!
        </Typography>
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="secondary"
            href="#"
            className="button-base button-secondary"
          >
            View Guidelines
          </Button>
          <Button href="#" className="button-base button-primary">
            Request Points
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-1">
        <Badge icon="🎨" name="Content Creator" shorthand="Creator" />
        <Badge icon="🛠️" name="Developer" />
        <Badge icon="🏛️" name="Governance Guardian" shorthand="Governance" />
        <Badge icon="💡" name="Innovator" />
        <Badge icon="📡" name="Relayer" />
        <Badge icon="🔐" name="Validator" />
        <Badge icon="🔁" name="Tx Specialist" />
      </div>
    </div>
  );
};

const CountdownItem: FC<{ timeUnit: string; value?: string }> = ({
  timeUnit,
  value,
}) => {
  const convertedValue = !value
    ? '--'
    : value.length === 1
    ? `0${value}`
    : value;

  return (
    <div className="w-full md:w-auto flex flex-col items-center gap-3">
      <div className="w-full md:w-auto flex gap-3 md:gap-4">
        {convertedValue.split('').map((char, idx) => (
          <div
            className={cx(
              'w-full aspect-[5/8] md:aspect-auto md:w-[55px] md:h-[92px]',
              'border border-mono-0 rounded-xl',
              'flex justify-center items-center',
              'bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(255,255,255,0.5)_100%)]',
              'shadow-[0_4px_4px_rgba(0,0,0,0.25)]'
            )}
            key={idx}
          >
            <Typography
              variant="mkt-h3"
              fw="black"
              className="text-center text-mono-200"
            >
              {char}
            </Typography>
          </div>
        ))}
      </div>
      <Typography
        variant="mkt-small-caps"
        fw="black"
        className="text-center text-mono-200"
      >
        {timeUnit}
      </Typography>
    </div>
  );
};

const Badge: FC<{ icon: string; name: string; shorthand?: string }> = ({
  icon,
  name,
  shorthand,
}) => {
  return (
    <>
      <Typography
        variant="mkt-body2"
        fw="bold"
        className="hidden md:block bg-[rgba(31,29,43,0.1)] px-2 py-[2px] rounded-full mt-1"
      >
        {icon} {name}
      </Typography>
      <Typography
        variant="mkt-body2"
        fw="bold"
        className="block md:hidden bg-[rgba(31,29,43,0.1)] px-2 py-[2px] rounded-full mt-1"
      >
        {icon} {shorthand || name}
      </Typography>
    </>
  );
};
