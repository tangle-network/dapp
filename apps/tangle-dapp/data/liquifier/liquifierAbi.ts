const liquifierAbi = [
  {
    type: 'constructor',
    stateMutability: 'nonpayable',
    inputs: [
      { internalType: 'address', name: '_registry', type: 'address' },
      { internalType: 'address', name: '_unlocks', type: 'address' },
    ],
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'uint256', name: 'assets', type: 'uint256' },
    ],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unlock',
    inputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
    outputs: [{ internalType: 'uint256', name: 'unlockID', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'uint256', name: 'unlockID', type: 'uint256' },
    ],
    outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'rebase',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'previewDeposit',
    inputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'previewWithdraw',
    inputs: [{ internalType: 'uint256', name: 'unlockID', type: 'uint256' }],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unlockMaturity',
    inputs: [{ internalType: 'uint256', name: 'unlockID', type: 'uint256' }],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Deposit',
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tgTokenOut',
        type: 'uint256',
      },
    ],
  },
  {
    type: 'event',
    name: 'Unlock',
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'unlockID',
        type: 'uint256',
      },
    ],
  },
  {
    type: 'event',
    name: 'Withdraw',
    inputs: [
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'unlockID',
        type: 'uint256',
      },
    ],
  },
  {
    type: 'event',
    name: 'Rebase',
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'currentStake',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newStake',
        type: 'uint256',
      },
    ],
  },
] as const;

export default liquifierAbi;
