import { LS_ERC20_TOKEN_IDS } from '../../constants/liquidStaking/constants';
import { LsErc20TokenId } from '../../constants/liquidStaking/types';

function isLsErc20TokenId(tokenId: number): tokenId is LsErc20TokenId {
  return LS_ERC20_TOKEN_IDS.includes(tokenId);
}

export default isLsErc20TokenId;
