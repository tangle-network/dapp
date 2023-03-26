import {
  Dropdown,
  DropdownBasicButton,
  TokenInput,
} from '@webb-tools/webb-ui-components';

import ChainDropdown from '../components/ChainDropdown';
import { InputValuesType } from '../provider';

// Note: This is a placeholder for now
// chain name -> supported token symbol -> contract address
const config = {
  arbitrum: {
    arbitrum: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  goerli: {
    eth: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
    weth: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  'Moonbase Alpha': {
    moonbeam: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  mumbai: {
    matic: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  optimism: {
    op: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  sepolia: {
    eth: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
};

const chainNames = Object.keys(config);

const inputValues: InputValuesType = {};

const InputsContainer = () => {
  return (
    <div>
      <div className="flex gap-2">
        <ChainDropdown chainNames={chainNames} />

        <Dropdown className="block grow shrink basis-0">
          <DropdownBasicButton isFullWidth>
            <TokenInput />
          </DropdownBasicButton>
        </Dropdown>
      </div>
    </div>
  );
};

export default InputsContainer;
