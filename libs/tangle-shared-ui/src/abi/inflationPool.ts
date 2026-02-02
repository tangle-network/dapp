// Auto-generated from tnt-core contracts
// Contract: INFLATION_POOL

const INFLATION_POOL_ABI = [
  {
    type: 'function',
    name: 'BPS_DENOMINATOR',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'SECONDS_PER_YEAR',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calculateEpochBudget',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'currentEpoch',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'epochLength',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'epochs',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'number',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'startTimestamp',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'endTimestamp',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'stakingDistributed',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'operatorsDistributed',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'customersDistributed',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'developersDistributed',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'restakersDistributed',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'distributed',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'fundingPeriodSeconds',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'fundingPeriodStartTimestamp',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEpoch',
    inputs: [
      {
        name: 'epochNumber',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct InflationPool.EpochData',
        components: [
          {
            name: 'number',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'startTimestamp',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'endTimestamp',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'stakingDistributed',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'operatorsDistributed',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'customersDistributed',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'developersDistributed',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'restakersDistributed',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'distributed',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWeights',
    inputs: [],
    outputs: [
      {
        name: 'stakingBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'operatorsBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'customersBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'developersBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'restakersBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isEpochReady',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'periodBudget',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'poolBalance',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'remainingPeriodBudget',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'secondsUntilNextEpoch',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalDistributed',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalFunded',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'weights',
    inputs: [],
    outputs: [
      {
        name: 'stakingBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'operatorsBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'customersBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'developersBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'restakersBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
] as const;

export default INFLATION_POOL_ABI;
