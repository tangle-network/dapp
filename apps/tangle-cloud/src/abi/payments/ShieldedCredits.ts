export const SHIELDED_CREDITS_ABI = [
  {
    type: 'function',
    name: 'fundCredits',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'commitment', type: 'bytes32' },
      { name: 'spendingKey', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'authorizeSpend',
    inputs: [
      {
        name: 'auth',
        type: 'tuple',
        components: [
          { name: 'commitment', type: 'bytes32' },
          { name: 'serviceId', type: 'uint64' },
          { name: 'jobIndex', type: 'uint8' },
          { name: 'amount', type: 'uint256' },
          { name: 'operator', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'expiry', type: 'uint64' },
          { name: 'signature', type: 'bytes' },
        ],
      },
    ],
    outputs: [{ name: 'authHash', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimPayment',
    inputs: [
      { name: 'authHash', type: 'bytes32' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawCredits',
    inputs: [
      { name: 'commitment', type: 'bytes32' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'reclaimExpiredAuth',
    inputs: [
      { name: 'authHash', type: 'bytes32' },
      { name: 'commitment', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAccount',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'spendingKey', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'balance', type: 'uint256' },
          { name: 'totalFunded', type: 'uint256' },
          { name: 'totalSpent', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSpendAuth',
    inputs: [{ name: 'authHash', type: 'bytes32' }],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'operator', type: 'address' },
      { name: 'expiry', type: 'uint64' },
      { name: 'claimed', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'CreditsFunded',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'newBalance', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CreditsSpent',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'authHash', type: 'bytes32', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'remaining', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PaymentClaimed',
    inputs: [
      { name: 'authHash', type: 'bytes32', indexed: true },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CreditsWithdrawn',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;
