// AUTO-GENERATED FROM tnt-core. DO NOT EDIT MANUALLY.
const ABI = [
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
        name: 'stakingPercent',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveServiceWithBls',
    inputs: [
      {
        name: 'requestId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'stakingPercent',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'blsPubkey',
        type: 'uint256[4]',
        internalType: 'uint256[4]',
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
    name: 'approveServiceWithCommitmentsAndBls',
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
      {
        name: 'blsPubkey',
        type: 'uint256[4]',
        internalType: 'uint256[4]',
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
    name: 'claimRewardsAll',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimRewardsBatch',
    inputs: [
      {
        name: 'tokens',
        type: 'address[]',
        internalType: 'address[]',
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
    name: 'defaultTntMinExposureBps',
    inputs: [],
    outputs: [
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
    name: 'extendServiceFromQuotes',
    inputs: [
      {
        name: 'serviceId',
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
        name: 'extensionDuration',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
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
        name: 'blueprintId',
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
        name: 'blueprintId',
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
    name: 'getOperatorBlsPubkey',
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
        name: 'blsPubkey',
        type: 'uint256[4]',
        internalType: 'uint256[4]',
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
        name: 'operator',
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
        name: 'operator',
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
        name: 'operator',
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
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorTotalActiveServices',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'count',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getService',
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
        name: 'operator',
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
        name: 'requestId',
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
    name: 'getServiceRequestSecurityCommitments',
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
    name: 'getServiceRequestSecurityRequirements',
    inputs: [
      {
        name: 'requestId',
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
            name: 'slashBps',
            type: 'uint16',
            internalType: 'uint16',
          },
          {
            name: 'effectiveSlashBps',
            type: 'uint16',
            internalType: 'uint16',
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
    name: 'isOperatorRegistered',
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
        name: 'operator',
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
    name: 'paymentSplit',
    inputs: [],
    outputs: [
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
        name: 'stakerBps',
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
    name: 'priceOracle',
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
        name: 'slashBps',
        type: 'uint16',
        internalType: 'uint16',
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
    stateMutability: 'nonpayable',
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
    stateMutability: 'nonpayable',
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
        name: 'exposureBps',
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
    name: 'rewardTokens',
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
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardVaults',
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
    name: 'serviceFeeDistributor',
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
    name: 'setDefaultTntMinExposureBps',
    inputs: [
      {
        name: 'minExposureBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
            name: 'stakerBps',
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
    name: 'setPriceOracle',
    inputs: [
      {
        name: 'oracle',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setRewardVaults',
    inputs: [
      {
        name: 'vaults',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setServiceFeeDistributor',
    inputs: [
      {
        name: 'distributor',
        type: 'address',
        internalType: 'address',
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
    name: 'setStaking',
    inputs: [
      {
        name: 'staking',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTntPaymentDiscountBps',
    inputs: [
      {
        name: 'discountBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTntToken',
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
    name: 'setTreasury',
    inputs: [
      {
        name: 'treasury',
        type: 'address',
        internalType: 'address',
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
        name: 'result',
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
        name: 'results',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'tntPaymentDiscountBps',
    inputs: [],
    outputs: [
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
    name: 'tntToken',
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
    name: 'treasury',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address payable',
      },
    ],
    stateMutability: 'view',
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
        name: 'result',
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
        indexed: true,
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
    name: 'SlashExecuted',
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
    name: 'SlashProposed',
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
        name: 'slashBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'evidence',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
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
] as const;

export default ABI;
