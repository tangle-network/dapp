// Local testnet mock token addresses for Base Sepolia (chain ID 84532)
// These are deployed by the tnt-core local setup script

import { Address } from 'viem';

export interface LocalTokenConfig {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

// Mock tokens deployed on local Base Sepolia testnet
export const LOCAL_MOCK_TOKENS: LocalTokenConfig[] = [
  {
    address: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  {
    address: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
  },
  {
    address: '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
  },
  {
    address: '0x59b670e9fA9D0A427751Af201D676719a970857b',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  {
    address: '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1',
    name: 'Lido Staked ETH',
    symbol: 'stETH',
    decimals: 18,
  },
  {
    address: '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44',
    name: 'Wrapped stETH',
    symbol: 'wstETH',
    decimals: 18,
  },
  {
    address: '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f',
    name: 'Eigen Token',
    symbol: 'EIGEN',
    decimals: 18,
  },
];

// Pre-deployed liquid delegation vaults on local testnet
export const LOCAL_LIQUID_VAULTS = [
  {
    address: '0xA1Ee49A7156D264f4F6f886c03726b296A0A3dbD' as Address,
    asset: '0x59b670e9fA9D0A427751Af201D676719a970857b' as Address, // WETH
    description: 'LiquidVault WETH (operator1)',
  },
  {
    address: '0x66A17eC6720cF120bA9F6512B529D8D80E5cd1D7' as Address,
    asset: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed' as Address, // USDC
    description: 'LiquidVault USDC (operator2)',
  },
];

// Helper to get token config by address
export const getLocalTokenByAddress = (
  address: Address,
): LocalTokenConfig | undefined => {
  return LOCAL_MOCK_TOKENS.find(
    (token) => token.address.toLowerCase() === address.toLowerCase(),
  );
};

// Helper to get token config by symbol
export const getLocalTokenBySymbol = (
  symbol: string,
): LocalTokenConfig | undefined => {
  return LOCAL_MOCK_TOKENS.find(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase(),
  );
};
