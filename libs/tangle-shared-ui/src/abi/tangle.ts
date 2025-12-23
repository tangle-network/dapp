// Auto-generated from tnt-core contracts
// Contract: TANGLE

const TANGLE_ABI = [
  {
    type: 'receive',
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'ADMIN_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DEFAULT_ADMIN_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'PAUSER_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'SLASH_ADMIN_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'UPGRADER_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'UPGRADE_INTERFACE_VERSION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addPermittedCaller',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'caller',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveService',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'restakingPercent',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveServiceWithCommitments',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'commitments',
        type: 'tuple[]',
        internalType: 'struct Types.AssetSecurityCommitment[]',
        components: [
          {
            name: 'asset',
            type: 'tuple',
            internalType: 'struct Types.Asset',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.AssetKind',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
            ],
          },
          {
            name: 'exposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'billSubscription',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'billSubscriptionBatch',
    inputs: [
      {
        name: 'serviceIds',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
    ],
    outputs: [
      {
        name: 'totalBilled',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'billedCount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'blueprintCount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'blueprintMasterRevision',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'blueprintMetadata',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: 'metadata',
        type: 'tuple',
        internalType: 'struct Types.BlueprintMetadata',
        components: [
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'description',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'author',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'category',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'codeRepository',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'logo',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'website',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'license',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'profilingData',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: 'metadataUri',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'blueprintOperatorCount',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
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
    name: 'blueprintSources',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: 'sources',
        type: 'tuple[]',
        internalType: 'struct Types.BlueprintSource[]',
        components: [
          {
            name: 'kind',
            type: 'uint8',
            internalType: 'enum Types.BlueprintSourceKind',
          },
          {
            name: 'container',
            type: 'tuple',
            internalType: 'struct Types.ImageRegistrySource',
            components: [
              {
                name: 'registry',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'image',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'tag',
                type: 'string',
                internalType: 'string',
              },
            ],
          },
          {
            name: 'wasm',
            type: 'tuple',
            internalType: 'struct Types.WasmSource',
            components: [
              {
                name: 'runtime',
                type: 'uint8',
                internalType: 'enum Types.WasmRuntime',
              },
              {
                name: 'fetcher',
                type: 'uint8',
                internalType: 'enum Types.BlueprintFetcherKind',
              },
              {
                name: 'artifactUri',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'entrypoint',
                type: 'string',
                internalType: 'string',
              },
            ],
          },
          {
            name: 'native',
            type: 'tuple',
            internalType: 'struct Types.NativeSource',
            components: [
              {
                name: 'fetcher',
                type: 'uint8',
                internalType: 'enum Types.BlueprintFetcherKind',
              },
              {
                name: 'artifactUri',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'entrypoint',
                type: 'string',
                internalType: 'string',
              },
            ],
          },
          {
            name: 'testing',
            type: 'tuple',
            internalType: 'struct Types.TestingSource',
            components: [
              {
                name: 'cargoPackage',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'cargoBin',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'basePath',
                type: 'string',
                internalType: 'string',
              },
            ],
          },
          {
            name: 'binaries',
            type: 'tuple[]',
            internalType: 'struct Types.BlueprintBinary[]',
            components: [
              {
                name: 'arch',
                type: 'uint8',
                internalType: 'enum Types.BlueprintArchitecture',
              },
              {
                name: 'os',
                type: 'uint8',
                internalType: 'enum Types.BlueprintOperatingSystem',
              },
              {
                name: 'name',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'sha256',
                type: 'bytes32',
                internalType: 'bytes32',
              },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'blueprintSupportedMemberships',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: 'memberships',
        type: 'uint8[]',
        internalType: 'enum Types.MembershipModel[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'canScheduleExit',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'canExit',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'reason',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'cancelExit',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelSlash',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'reason',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimRewards',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimRewards',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createBlueprint',
    inputs: [
      {
        name: 'def',
        type: 'tuple',
        internalType: 'struct Types.BlueprintDefinition',
        components: [
          {
            name: 'metadataUri',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'manager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'masterManagerRevision',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'hasConfig',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'config',
            type: 'tuple',
            internalType: 'struct Types.BlueprintConfig',
            components: [
              {
                name: 'membership',
                type: 'uint8',
                internalType: 'enum Types.MembershipModel',
              },
              {
                name: 'pricing',
                type: 'uint8',
                internalType: 'enum Types.PricingModel',
              },
              {
                name: 'minOperators',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'maxOperators',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'subscriptionRate',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'subscriptionInterval',
                type: 'uint64',
                internalType: 'uint64',
              },
              {
                name: 'eventRate',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'operatorBond',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'metadata',
            type: 'tuple',
            internalType: 'struct Types.BlueprintMetadata',
            components: [
              {
                name: 'name',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'description',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'author',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'category',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'codeRepository',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'logo',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'website',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'license',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'profilingData',
                type: 'string',
                internalType: 'string',
              },
            ],
          },
          {
            name: 'jobs',
            type: 'tuple[]',
            internalType: 'struct Types.JobDefinition[]',
            components: [
              {
                name: 'name',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'description',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'metadataUri',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'paramsSchema',
                type: 'bytes',
                internalType: 'bytes',
              },
              {
                name: 'resultSchema',
                type: 'bytes',
                internalType: 'bytes',
              },
            ],
          },
          {
            name: 'registrationSchema',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'requestSchema',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'sources',
            type: 'tuple[]',
            internalType: 'struct Types.BlueprintSource[]',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.BlueprintSourceKind',
              },
              {
                name: 'container',
                type: 'tuple',
                internalType: 'struct Types.ImageRegistrySource',
                components: [
                  {
                    name: 'registry',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'image',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'tag',
                    type: 'string',
                    internalType: 'string',
                  },
                ],
              },
              {
                name: 'wasm',
                type: 'tuple',
                internalType: 'struct Types.WasmSource',
                components: [
                  {
                    name: 'runtime',
                    type: 'uint8',
                    internalType: 'enum Types.WasmRuntime',
                  },
                  {
                    name: 'fetcher',
                    type: 'uint8',
                    internalType: 'enum Types.BlueprintFetcherKind',
                  },
                  {
                    name: 'artifactUri',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'entrypoint',
                    type: 'string',
                    internalType: 'string',
                  },
                ],
              },
              {
                name: 'native',
                type: 'tuple',
                internalType: 'struct Types.NativeSource',
                components: [
                  {
                    name: 'fetcher',
                    type: 'uint8',
                    internalType: 'enum Types.BlueprintFetcherKind',
                  },
                  {
                    name: 'artifactUri',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'entrypoint',
                    type: 'string',
                    internalType: 'string',
                  },
                ],
              },
              {
                name: 'testing',
                type: 'tuple',
                internalType: 'struct Types.TestingSource',
                components: [
                  {
                    name: 'cargoPackage',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'cargoBin',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'basePath',
                    type: 'string',
                    internalType: 'string',
                  },
                ],
              },
              {
                name: 'binaries',
                type: 'tuple[]',
                internalType: 'struct Types.BlueprintBinary[]',
                components: [
                  {
                    name: 'arch',
                    type: 'uint8',
                    internalType: 'enum Types.BlueprintArchitecture',
                  },
                  {
                    name: 'os',
                    type: 'uint8',
                    internalType: 'enum Types.BlueprintOperatingSystem',
                  },
                  {
                    name: 'name',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'sha256',
                    type: 'bytes32',
                    internalType: 'bytes32',
                  },
                ],
              },
            ],
          },
          {
            name: 'supportedMemberships',
            type: 'uint8[]',
            internalType: 'enum Types.MembershipModel[]',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createServiceFromQuotes',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'quotes',
        type: 'tuple[]',
        internalType: 'struct Types.SignedQuote[]',
        components: [
          {
            name: 'details',
            type: 'tuple',
            internalType: 'struct Types.QuoteDetails',
            components: [
              {
                name: 'blueprintId',
                type: 'uint64',
                internalType: 'uint64',
              },
              {
                name: 'ttlBlocks',
                type: 'uint64',
                internalType: 'uint64',
              },
              {
                name: 'totalCost',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'timestamp',
                type: 'uint64',
                internalType: 'uint64',
              },
              {
                name: 'expiry',
                type: 'uint64',
                internalType: 'uint64',
              },
              {
                name: 'securityCommitments',
                type: 'tuple[]',
                internalType: 'struct Types.AssetSecurityCommitment[]',
                components: [
                  {
                    name: 'asset',
                    type: 'tuple',
                    internalType: 'struct Types.Asset',
                    components: [
                      {
                        name: 'kind',
                        type: 'uint8',
                        internalType: 'enum Types.AssetKind',
                      },
                      {
                        name: 'token',
                        type: 'address',
                        internalType: 'address',
                      },
                    ],
                  },
                  {
                    name: 'exposureBps',
                    type: 'uint16',
                    internalType: 'uint16',
                  },
                ],
              },
            ],
          },
          {
            name: 'signature',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'operator',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: 'config',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'permittedCallers',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'ttl',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'deactivateBlueprint',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'disputeSlash',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'reason',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeExit',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeSlash',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: 'actualSlashed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeSlashBatch',
    inputs: [
      {
        name: 'slashIds',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
    ],
    outputs: [
      {
        name: 'totalSlashed',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'executedCount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'forceExit',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'fundService',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getBillableServices',
    inputs: [
      {
        name: 'serviceIds',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
    ],
    outputs: [
      {
        name: 'billable',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBlueprint',
    inputs: [
      {
        name: 'id',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.Blueprint',
        components: [
          {
            name: 'owner',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'manager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'createdAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'operatorCount',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'membership',
            type: 'uint8',
            internalType: 'enum Types.MembershipModel',
          },
          {
            name: 'pricing',
            type: 'uint8',
            internalType: 'enum Types.PricingModel',
          },
          {
            name: 'active',
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
    name: 'getBlueprintConfig',
    inputs: [
      {
        name: 'id',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.BlueprintConfig',
        components: [
          {
            name: 'membership',
            type: 'uint8',
            internalType: 'enum Types.MembershipModel',
          },
          {
            name: 'pricing',
            type: 'uint8',
            internalType: 'enum Types.PricingModel',
          },
          {
            name: 'minOperators',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'maxOperators',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'subscriptionRate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'subscriptionInterval',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'eventRate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'operatorBond',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBlueprintDefinition',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: 'definition',
        type: 'tuple',
        internalType: 'struct Types.BlueprintDefinition',
        components: [
          {
            name: 'metadataUri',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'manager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'masterManagerRevision',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'hasConfig',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'config',
            type: 'tuple',
            internalType: 'struct Types.BlueprintConfig',
            components: [
              {
                name: 'membership',
                type: 'uint8',
                internalType: 'enum Types.MembershipModel',
              },
              {
                name: 'pricing',
                type: 'uint8',
                internalType: 'enum Types.PricingModel',
              },
              {
                name: 'minOperators',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'maxOperators',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'subscriptionRate',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'subscriptionInterval',
                type: 'uint64',
                internalType: 'uint64',
              },
              {
                name: 'eventRate',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'operatorBond',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'metadata',
            type: 'tuple',
            internalType: 'struct Types.BlueprintMetadata',
            components: [
              {
                name: 'name',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'description',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'author',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'category',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'codeRepository',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'logo',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'website',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'license',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'profilingData',
                type: 'string',
                internalType: 'string',
              },
            ],
          },
          {
            name: 'jobs',
            type: 'tuple[]',
            internalType: 'struct Types.JobDefinition[]',
            components: [
              {
                name: 'name',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'description',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'metadataUri',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'paramsSchema',
                type: 'bytes',
                internalType: 'bytes',
              },
              {
                name: 'resultSchema',
                type: 'bytes',
                internalType: 'bytes',
              },
            ],
          },
          {
            name: 'registrationSchema',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'requestSchema',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'sources',
            type: 'tuple[]',
            internalType: 'struct Types.BlueprintSource[]',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.BlueprintSourceKind',
              },
              {
                name: 'container',
                type: 'tuple',
                internalType: 'struct Types.ImageRegistrySource',
                components: [
                  {
                    name: 'registry',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'image',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'tag',
                    type: 'string',
                    internalType: 'string',
                  },
                ],
              },
              {
                name: 'wasm',
                type: 'tuple',
                internalType: 'struct Types.WasmSource',
                components: [
                  {
                    name: 'runtime',
                    type: 'uint8',
                    internalType: 'enum Types.WasmRuntime',
                  },
                  {
                    name: 'fetcher',
                    type: 'uint8',
                    internalType: 'enum Types.BlueprintFetcherKind',
                  },
                  {
                    name: 'artifactUri',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'entrypoint',
                    type: 'string',
                    internalType: 'string',
                  },
                ],
              },
              {
                name: 'native',
                type: 'tuple',
                internalType: 'struct Types.NativeSource',
                components: [
                  {
                    name: 'fetcher',
                    type: 'uint8',
                    internalType: 'enum Types.BlueprintFetcherKind',
                  },
                  {
                    name: 'artifactUri',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'entrypoint',
                    type: 'string',
                    internalType: 'string',
                  },
                ],
              },
              {
                name: 'testing',
                type: 'tuple',
                internalType: 'struct Types.TestingSource',
                components: [
                  {
                    name: 'cargoPackage',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'cargoBin',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'basePath',
                    type: 'string',
                    internalType: 'string',
                  },
                ],
              },
              {
                name: 'binaries',
                type: 'tuple[]',
                internalType: 'struct Types.BlueprintBinary[]',
                components: [
                  {
                    name: 'arch',
                    type: 'uint8',
                    internalType: 'enum Types.BlueprintArchitecture',
                  },
                  {
                    name: 'os',
                    type: 'uint8',
                    internalType: 'enum Types.BlueprintOperatingSystem',
                  },
                  {
                    name: 'name',
                    type: 'string',
                    internalType: 'string',
                  },
                  {
                    name: 'sha256',
                    type: 'bytes32',
                    internalType: 'bytes32',
                  },
                ],
              },
            ],
          },
          {
            name: 'supportedMemberships',
            type: 'uint8[]',
            internalType: 'enum Types.MembershipModel[]',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getExecutableSlashes',
    inputs: [
      {
        name: 'fromId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'toId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: 'ids',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getExitConfig',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.ExitConfig',
        components: [
          {
            name: 'minCommitmentDuration',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'exitQueueDuration',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'forceExitAllowed',
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
    name: 'getExitRequest',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.ExitRequest',
        components: [
          {
            name: 'serviceId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'scheduledAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'executeAfter',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'pending',
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
    name: 'getExitStatus',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'enum Types.ExitStatus',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getJobCall',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.JobCall',
        components: [
          {
            name: 'jobIndex',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'caller',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'createdAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'resultCount',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'payment',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'completed',
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
    name: 'getOperatorPreferences',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'op',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.OperatorPreferences',
        components: [
          {
            name: 'ecdsaPublicKey',
            type: 'bytes',
            internalType: 'bytes',
          },
          {
            name: 'rpcAddress',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorPublicKey',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'op',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorRegistration',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'op',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.OperatorRegistration',
        components: [
          {
            name: 'registeredAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'updatedAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'active',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'online',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'bondAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'bondToken',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleAdmin',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getService',
    inputs: [
      {
        name: 'id',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.Service',
        components: [
          {
            name: 'blueprintId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'owner',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'createdAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'ttl',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'terminatedAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'lastPaymentAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'operatorCount',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'minOperators',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'maxOperators',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'membership',
            type: 'uint8',
            internalType: 'enum Types.MembershipModel',
          },
          {
            name: 'pricing',
            type: 'uint8',
            internalType: 'enum Types.PricingModel',
          },
          {
            name: 'status',
            type: 'uint8',
            internalType: 'enum Types.ServiceStatus',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getServiceEscrow',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct PaymentLib.ServiceEscrow',
        components: [
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'balance',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'totalDeposited',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'totalReleased',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getServiceOperator',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'op',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.ServiceOperator',
        components: [
          {
            name: 'exposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
          {
            name: 'joinedAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'leftAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'active',
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
    name: 'getServiceOperators',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getServiceRequest',
    inputs: [
      {
        name: 'id',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.ServiceRequest',
        components: [
          {
            name: 'blueprintId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'requester',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'createdAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'ttl',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'operatorCount',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'approvalCount',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'paymentToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'paymentAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'membership',
            type: 'uint8',
            internalType: 'enum Types.MembershipModel',
          },
          {
            name: 'minOperators',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'maxOperators',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'rejected',
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
    name: 'getSlashProposal',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct SlashingLib.SlashProposal',
        components: [
          {
            name: 'serviceId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'operator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'amount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'effectiveAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'evidence',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'proposedAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'executeAfter',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'status',
            type: 'uint8',
            internalType: 'enum SlashingLib.SlashStatus',
          },
          {
            name: 'disputeReason',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grantRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'initialize',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'restaking_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'treasury_',
        type: 'address',
        internalType: 'address payable',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isOperatorRegistered',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'op',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'isPermittedCaller',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'caller',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'isServiceActive',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
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
    name: 'isServiceOperator',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'op',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'joinService',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'exposureBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'leaveService',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'maxBlueprintsPerOperator',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mbsmRegistry',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'metricsRecorder',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'operatorBlueprintBond',
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
    name: 'operatorBlueprintCount',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'operatorBondToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'operatorStatusRegistry',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'paused',
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
    name: 'paymentSplit',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pendingRewards',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'pendingRewards',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'preRegister',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'proposeSlash',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'evidence',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'proxiableUUID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerOperator',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'ecdsaPublicKey',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'rpcAddress',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'registrationInputs',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'registerOperator',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'ecdsaPublicKey',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'rpcAddress',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'rejectService',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removePermittedCaller',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'caller',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'callerConfirmation',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestService',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operators',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'config',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'permittedCallers',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'ttl',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'paymentToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'paymentAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'requestServiceWithExposure',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operators',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'exposures',
        type: 'uint16[]',
        internalType: 'uint16[]',
      },
      {
        name: 'config',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'permittedCallers',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'ttl',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'paymentToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'paymentAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'requestServiceWithSecurity',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operators',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'securityRequirements',
        type: 'tuple[]',
        internalType: 'struct Types.AssetSecurityRequirement[]',
        components: [
          {
            name: 'asset',
            type: 'tuple',
            internalType: 'struct Types.Asset',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.AssetKind',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
            ],
          },
          {
            name: 'minExposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
          {
            name: 'maxExposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
      {
        name: 'config',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'permittedCallers',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'ttl',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'paymentToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'paymentAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'revokeRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'scheduleExit',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'serviceCount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'serviceRequestCount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setMBSMRegistry',
    inputs: [
      {
        name: 'registry',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMaxBlueprintsPerOperator',
    inputs: [
      {
        name: 'newMax',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMetricsRecorder',
    inputs: [
      {
        name: 'recorder',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setOperatorBlueprintBond',
    inputs: [
      {
        name: 'newBond',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setOperatorBondAsset',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setOperatorStatusRegistry',
    inputs: [
      {
        name: 'registry',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPaymentSplit',
    inputs: [
      {
        name: 'split',
        type: 'tuple',
        internalType: 'struct Types.PaymentSplit',
        components: [
          {
            name: 'developerBps',
            type: 'uint16',
            internalType: 'uint16',
          },
          {
            name: 'protocolBps',
            type: 'uint16',
            internalType: 'uint16',
          },
          {
            name: 'operatorBps',
            type: 'uint16',
            internalType: 'uint16',
          },
          {
            name: 'restakerBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setSlashConfig',
    inputs: [
      {
        name: 'disputeWindow',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'instantSlashEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'maxSlashBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTreasury',
    inputs: [
      {
        name: 'treasury_',
        type: 'address',
        internalType: 'address payable',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitAggregatedResult',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'output',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'signerBitmap',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'aggregatedSignature',
        type: 'uint256[2]',
        internalType: 'uint256[2]',
      },
      {
        name: 'aggregatedPubkey',
        type: 'uint256[4]',
        internalType: 'uint256[4]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitJob',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'jobIndex',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'inputs',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'callId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'submitResult',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'output',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitResults',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'callIds',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
      {
        name: 'outputs',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        name: 'interfaceId',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
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
    name: 'terminateService',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferBlueprint',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unregisterOperator',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateBlueprint',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'metadataUri',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateOperatorPreferences',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'ecdsaPublicKey',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'rpcAddress',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeToAndCall',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'AggregatedResultSubmitted',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'signerBitmap',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'output',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BlueprintCreated',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'manager',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'metadataUri',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BlueprintDeactivated',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BlueprintTransferred',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BlueprintUpdated',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'metadataUri',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EscrowFunded',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ExitCanceled',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ExitForced',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'forcer',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ExitScheduled',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'executeAfter',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'JobCompleted',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'JobResultSubmitted',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'output',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'JobSubmitted',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'jobIndex',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'caller',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'inputs',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MBSMRegistryUpdated',
    inputs: [
      {
        name: 'registry',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorJoinedService',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'exposureBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorLeftService',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorPreRegistered',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorPreferencesUpdated',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'ecdsaPublicKey',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
      {
        name: 'rpcAddress',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorRegistered',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'ecdsaPublicKey',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
      {
        name: 'rpcAddress',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorUnregistered',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Paused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'QuoteUsed',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'quoteHash',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardsClaimed',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleAdminChanged',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'previousAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'newAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleGranted',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleRevoked',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ServiceActivated',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'requestId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ServiceApproved',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ServiceRejected',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ServiceRequested',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'requester',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ServiceRequestedWithSecurity',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'requester',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'operators',
        type: 'address[]',
        indexed: false,
        internalType: 'address[]',
      },
      {
        name: 'securityRequirements',
        type: 'tuple[]',
        indexed: false,
        internalType: 'struct Types.AssetSecurityRequirement[]',
        components: [
          {
            name: 'asset',
            type: 'tuple',
            internalType: 'struct Types.Asset',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.AssetKind',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
            ],
          },
          {
            name: 'minExposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
          {
            name: 'maxExposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ServiceTerminated',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SlashCancelled',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'canceller',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'reason',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SlashConfigUpdated',
    inputs: [
      {
        name: 'disputeWindow',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
      {
        name: 'instantSlashEnabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'maxSlashBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SlashDisputed',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'disputer',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'reason',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SlashExecuted',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'actualSlashed',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SlashProposed',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'proposer',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'effectiveAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'evidence',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'executeAfter',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SubscriptionBilled',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'period',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Unpaused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Upgraded',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AccessControlBadConfirmation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AccessControlUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'neededRole',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'AddressEmptyCode',
    inputs: [
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'AggregationNotRequired',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'jobIndex',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
  },
  {
    type: 'error',
    name: 'AggregationRequired',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'jobIndex',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
  },
  {
    type: 'error',
    name: 'AggregationThresholdNotMet',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'achieved',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'required',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'AlreadyApproved',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'BlueprintBinaryHashRequired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BlueprintBinaryRequired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BlueprintMembershipRequired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BlueprintMetadataRequired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BlueprintNotActive',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'BlueprintNotFound',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'BlueprintSourcesRequired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CommitmentAboveMaximum',
    inputs: [
      {
        name: 'asset',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'committed',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'maximum',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
  },
  {
    type: 'error',
    name: 'CommitmentBelowMinimum',
    inputs: [
      {
        name: 'asset',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'committed',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'minimum',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
  },
  {
    type: 'error',
    name: 'DeadlineExpired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DisputeWindowPassed',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'DuplicateOperatorKey',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'keyHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'DuplicateOperatorQuote',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ECDSAInvalidSignature',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ECDSAInvalidSignatureLength',
    inputs: [
      {
        name: 'length',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'ECDSAInvalidSignatureS',
    inputs: [
      {
        name: 's',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC1967InvalidImplementation',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC1967NonPayable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EnforcedPause',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExitAlreadyScheduled',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ExitNotExecutable',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'executeAfter',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'currentTime',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'ExitNotScheduled',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ExitTooEarly',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'minCommitmentEnd',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'currentTime',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'ExpectedPause',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FailedCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ForceExitNotAllowed',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'HashToPointFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InstantSlashNotEnabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientEscrowBalance',
    inputs: [
      {
        name: 'required',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'available',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientOperators',
    inputs: [
      {
        name: 'required',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'provided',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientPayment',
    inputs: [
      {
        name: 'required',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sent',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientPaymentForQuotes',
    inputs: [
      {
        name: 'totalCost',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'payment',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientStake',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'required',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'actual',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidBLSSignature',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidJobIndex',
    inputs: [
      {
        name: 'jobIndex',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidOperatorKey',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidPaymentSplit',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidPaymentToken',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidQuoteSignature',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidSecurityRequirement',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSlashAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSlashConfig',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidState',
    inputs: [],
  },
  {
    type: 'error',
    name: 'JobAlreadyCompleted',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'JobCallNotFound',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'LengthMismatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MBSMRegistryNotSet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ManagerRejected',
    inputs: [
      {
        name: 'manager',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ManagerReverted',
    inputs: [
      {
        name: 'manager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'reason',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
  },
  {
    type: 'error',
    name: 'MasterManagerUnavailable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MaxBlueprintsPerOperatorExceeded',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'maxAllowed',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
  },
  {
    type: 'error',
    name: 'MissingAssetCommitment',
    inputs: [
      {
        name: 'asset',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'NoOperators',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NoQuotes',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NoSecurityRequirements',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotBlueprintOwner',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'caller',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotPermittedCaller',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'caller',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'NotServiceOwner',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'caller',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'NotSlashCanceller',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'caller',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'NotSlashDisputer',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'caller',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperatorAlreadyRegistered',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperatorBondMismatch',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'required',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sent',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperatorBondRefundFailed',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperatorNotActive',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperatorNotInService',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperatorNotRegistered',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'PairingFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PaymentFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'QuoteAlreadyUsed',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'QuoteBlueprintMismatch',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'expectedBlueprint',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'quotedBlueprint',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'QuoteExpired',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'expiry',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'QuoteTTLMismatch',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'expectedTtl',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'quotedTtl',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ResultAlreadySubmitted',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'callId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'SchemaValidationFailed',
    inputs: [
      {
        name: 'target',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'refId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'auxId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'path',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'ServiceExpired',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'ServiceNotActive',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'ServiceNotFound',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'ServiceRequestAlreadyProcessed',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'ServiceRequestNotFound',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'SlashAlreadyCancelled',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'SlashAlreadyExecuted',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'SlashNotExecutable',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'SlashNotFound',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'SlashNotPending',
    inputs: [
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'TokenNotAllowed',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'TooManyOperators',
    inputs: [
      {
        name: 'maximum',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'provided',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
  },
  {
    type: 'error',
    name: 'UUPSUnauthorizedCallContext',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UUPSUnsupportedProxiableUUID',
    inputs: [
      {
        name: 'slot',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UnsupportedFieldKind',
    inputs: [
      {
        name: 'kind',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
  {
    type: 'function',
    name: 'forceRemoveOperator',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getServiceSecurityCommitments',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct Types.AssetSecurityCommitment[]',
        components: [
          {
            name: 'asset',
            type: 'tuple',
            internalType: 'struct Types.Asset',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.AssetKind',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
            ],
          },
          {
            name: 'exposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getServiceSecurityRequirements',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct Types.AssetSecurityRequirement[]',
        components: [
          {
            name: 'asset',
            type: 'tuple',
            internalType: 'struct Types.Asset',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.AssetKind',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
            ],
          },
          {
            name: 'minExposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
          {
            name: 'maxExposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getServiceTotalExposure',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
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
    name: 'joinServiceWithCommitments',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'exposureBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'commitments',
        type: 'tuple[]',
        internalType: 'struct Types.AssetSecurityCommitment[]',
        components: [
          {
            name: 'asset',
            type: 'tuple',
            internalType: 'struct Types.Asset',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.AssetKind',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
            ],
          },
          {
            name: 'exposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setOperatorOnline',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'online',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitJobs',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'jobIndices',
        type: 'uint8[]',
        internalType: 'uint8[]',
      },
      {
        name: 'inputs',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [
      {
        name: 'callIds',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
    ],
    stateMutability: 'payable',
  },
] as const;

export default TANGLE_ABI;
