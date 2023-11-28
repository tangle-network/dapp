import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

import Badges from './Badges';
import CTAButtons from './CTAButtons';
import TimeRemaining from './TimeRemaining';

const CountdownSection = () => {
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

      <TimeRemaining />

      <div className="space-y-4">
        <Typography
          variant="mkt-body2"
          fw="medium"
          className="text-center text-mono-140"
        >
          Unlock points and badges as you engage in the Tangle Network. Explore
          the guidelines or request points now!
        </Typography>

        <CTAButtons />
      </div>

      <Badges />
    </div>
  );
};

export default CountdownSection;
