import {
  Dropdown,
  DropdownBasicButton,
  TokenInput,
} from '@webb-tools/webb-ui-components';

import ChainDropdown from '../components/ChainDropdown';

// Note: This is a placeholder for now
// chain name -> supported token symbol -> contract address
const config = {
  arbitrum: {
    wTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  goerli: {
    webbtTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  'Moonbase Alpha': {
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  mumbai: {
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  optimism: {
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  sepolia: {
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
};

const chainNames = Object.keys(config);

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
