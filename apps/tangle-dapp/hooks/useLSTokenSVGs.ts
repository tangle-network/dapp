import ASTAR from '@webb-tools/icons/LiquidStakingTokens/ASTAR.svg';
import DOT from '@webb-tools/icons/LiquidStakingTokens/DOT.svg';
import GLMR from '@webb-tools/icons/LiquidStakingTokens/GLMR.svg';
import MANTA from '@webb-tools/icons/LiquidStakingTokens/MANTA.svg';
import PHALA from '@webb-tools/icons/LiquidStakingTokens/PHALA.svg';
import React, { useMemo } from 'react';

import { LiquidStakingToken } from '../constants/liquidStaking';

const tokenSVGs: {
  [key in LiquidStakingToken]: React.FC<React.SVGProps<SVGSVGElement>>;
} = {
  ASTAR,
  DOT,
  GLMR,
  MANTA,
  PHALA,
};

const useLSTokenSVGs = (
  tokenSymbol: LiquidStakingToken,
): React.FC<React.SVGProps<SVGSVGElement>> | null => {
  const TokenSVG = useMemo(() => tokenSVGs[tokenSymbol] || null, [tokenSymbol]);

  return TokenSVG;
};

export default useLSTokenSVGs;
