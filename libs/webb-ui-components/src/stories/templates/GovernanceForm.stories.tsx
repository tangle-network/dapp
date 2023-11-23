import type { Meta, StoryObj } from '@storybook/react';
import GovernanceForm from '../../components/GovernanceForm/GovernanceForm';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';

const meta: Meta<typeof GovernanceForm> = {
  title: 'Design System/Templates/GovernanceForm',
  component: GovernanceForm,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof GovernanceForm>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <GovernanceForm
      governanceFncNames={['setHandler', 'setVerifier']}
      typedChainIdSelections={Object.keys(chainsConfig)
        .slice(0, 8)
        .map((chainId) => +chainId)}
      abi={[
        {
          inputs: [
            {
              internalType: 'contract IAnchorVerifier',
              name: '_verifier',
              type: 'address',
            },
            {
              internalType: 'uint32',
              name: '_merkleTreeLevels',
              type: 'uint32',
            },
            {
              internalType: 'contract IHasher',
              name: '_hasher',
              type: 'address',
            },
            { internalType: 'address', name: '_handler', type: 'address' },
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint8', name: '_maxEdges', type: 'uint8' },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'chainID',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'latestLeafIndex',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'merkleRoot',
              type: 'uint256',
            },
          ],
          name: 'EdgeAddition',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'chainID',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'latestLeafIndex',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'merkleRoot',
              type: 'uint256',
            },
          ],
          name: 'EdgeUpdate',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'uint256',
              name: 'commitment',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint32',
              name: 'leafIndex',
              type: 'uint32',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'timestamp',
              type: 'uint256',
            },
            {
              indexed: true,
              internalType: 'uint256',
              name: 'newMerkleRoot',
              type: 'uint256',
            },
          ],
          name: 'Insertion',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'commitment',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'subTreeIndex',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'leafIndex',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'bytes',
              name: 'encryptedOutput',
              type: 'bytes',
            },
          ],
          name: 'NewCommitment',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'nullifier',
              type: 'uint256',
            },
          ],
          name: 'NewNullifier',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'owner',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'bytes',
              name: 'key',
              type: 'bytes',
            },
          ],
          name: 'PublicKey',
          type: 'event',
        },
        {
          inputs: [],
          name: 'EVM_CHAIN_ID_TYPE',
          outputs: [{ internalType: 'bytes2', name: '', type: 'bytes2' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'FIELD_SIZE',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'MAX_EXT_AMOUNT',
          outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'MAX_FEE',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'ROOT_HISTORY_SIZE',
          outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'ZERO_VALUE',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_fromTokenAddress',
              type: 'address',
            },
            {
              internalType: 'address',
              name: '_toTokenAddress',
              type: 'address',
            },
            { internalType: 'uint256', name: '_extAmount', type: 'uint256' },
          ],
          name: '_executeWrapping',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'payable',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'bytes', name: '', type: 'bytes' },
            {
              components: [
                { internalType: 'address', name: 'recipient', type: 'address' },
                { internalType: 'int256', name: 'extAmount', type: 'int256' },
                { internalType: 'address', name: 'relayer', type: 'address' },
                { internalType: 'uint256', name: 'fee', type: 'uint256' },
                { internalType: 'uint256', name: 'refund', type: 'uint256' },
                { internalType: 'address', name: 'token', type: 'address' },
              ],
              internalType: 'struct CommonExtData',
              name: '_externalData',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'bytes',
                  name: 'encryptedOutput1',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'encryptedOutput2',
                  type: 'bytes',
                },
              ],
              internalType: 'struct Encryptions',
              name: '_encryptions',
              type: 'tuple',
            },
          ],
          name: '_genExtDataHash',
          outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_fromTokenAddress',
              type: 'address',
            },
            {
              internalType: 'address',
              name: '_toTokenAddress',
              type: 'address',
            },
            { internalType: 'address', name: '_recipient', type: 'address' },
            {
              internalType: 'uint256',
              name: '_minusExtAmount',
              type: 'uint256',
            },
          ],
          name: '_withdrawAndUnwrap',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'int256', name: '_extAmount', type: 'int256' },
            { internalType: 'uint256', name: '_fee', type: 'uint256' },
          ],
          name: 'calculatePublicAmount',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'pure',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          name: 'commitments',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '_maximumDepositAmount',
              type: 'uint256',
            },
            { internalType: 'uint32', name: '_nonce', type: 'uint32' },
          ],
          name: 'configureMaximumDepositLimit',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '_minimalWithdrawalAmount',
              type: 'uint256',
            },
            { internalType: 'uint32', name: '_nonce', type: 'uint32' },
          ],
          name: 'configureMinimalWithdrawalLimit',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          name: 'currentNeighborRootIndex',
          outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'currentRootIndex',
          outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          name: 'edgeExistsForChain',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          name: 'edgeIndex',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          name: 'edgeList',
          outputs: [
            { internalType: 'uint256', name: 'chainID', type: 'uint256' },
            { internalType: 'uint256', name: 'root', type: 'uint256' },
            {
              internalType: 'uint256',
              name: 'latestLeafIndex',
              type: 'uint256',
            },
            { internalType: 'bytes32', name: 'srcResourceID', type: 'bytes32' },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          name: 'filledSubtrees',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'getChainId',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'getChainIdType',
          outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'getHasher',
          outputs: [
            { internalType: 'contract IHasher', name: '', type: 'address' },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'getLastRoot',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'getLatestNeighborEdges',
          outputs: [
            {
              components: [
                { internalType: 'uint256', name: 'chainID', type: 'uint256' },
                { internalType: 'uint256', name: 'root', type: 'uint256' },
                {
                  internalType: 'uint256',
                  name: 'latestLeafIndex',
                  type: 'uint256',
                },
                {
                  internalType: 'bytes32',
                  name: 'srcResourceID',
                  type: 'bytes32',
                },
              ],
              internalType: 'struct Edge[]',
              name: '',
              type: 'tuple[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'getLatestNeighborRoots',
          outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'getLevels',
          outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'getNextIndex',
          outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'getProposalNonce',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint32', name: 'index', type: 'uint32' }],
          name: 'getZeroHash',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'handler',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256', name: '_chainID', type: 'uint256' },
          ],
          name: 'hasEdge',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256', name: '_left', type: 'uint256' },
            { internalType: 'uint256', name: '_right', type: 'uint256' },
          ],
          name: 'hashLeftRight',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'hasher',
          outputs: [
            { internalType: 'contract IHasher', name: '', type: 'address' },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '_minimalWithdrawalAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: '_maximumDepositAmount',
              type: 'uint256',
            },
          ],
          name: 'initialize',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'initialized',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'bytes32', name: 'resourceID', type: 'bytes32' },
          ],
          name: 'isCorrectExecutionChain',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'bytes32', name: 'resourceId', type: 'bytes32' },
          ],
          name: 'isCorrectExecutionContext',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '_neighborChainID',
              type: 'uint256',
            },
            { internalType: 'uint256', name: '_root', type: 'uint256' },
          ],
          name: 'isKnownNeighborRoot',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: '_root', type: 'uint256' }],
          name: 'isKnownRoot',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '_nullifierHash',
              type: 'uint256',
            },
          ],
          name: 'isSpent',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256[]',
              name: '_nullifierHashes',
              type: 'uint256[]',
            },
          ],
          name: 'isSpentArray',
          outputs: [{ internalType: 'bool[]', name: '', type: 'bool[]' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256[]', name: '_roots', type: 'uint256[]' },
          ],
          name: 'isValidRoots',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'lastBalance',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'levels',
          outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'maxEdges',
          outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'maximumDepositAmount',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'minimalWithdrawalAmount',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint32', name: '', type: 'uint32' },
          ],
          name: 'neighborRoots',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'nextIndex',
          outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          name: 'nullifierHashes',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'outerLevels',
          outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'bytes32', name: '_resourceId', type: 'bytes32' },
          ],
          name: 'parseChainIdFromResourceId',
          outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
          stateMutability: 'pure',
          type: 'function',
        },
        {
          inputs: [],
          name: 'proposalNonce',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                { internalType: 'address', name: 'owner', type: 'address' },
                { internalType: 'bytes', name: 'keyData', type: 'bytes' },
              ],
              internalType: 'struct VAnchorBase.Account',
              name: '_account',
              type: 'tuple',
            },
          ],
          name: 'register',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              components: [
                { internalType: 'address', name: 'owner', type: 'address' },
                { internalType: 'bytes', name: 'keyData', type: 'bytes' },
              ],
              internalType: 'struct VAnchorBase.Account',
              name: '_account',
              type: 'tuple',
            },
            { internalType: 'bytes', name: '_proof', type: 'bytes' },
            { internalType: 'bytes', name: '_auxPublicInputs', type: 'bytes' },
            {
              components: [
                { internalType: 'address', name: 'recipient', type: 'address' },
                { internalType: 'int256', name: 'extAmount', type: 'int256' },
                { internalType: 'address', name: 'relayer', type: 'address' },
                { internalType: 'uint256', name: 'fee', type: 'uint256' },
                { internalType: 'uint256', name: 'refund', type: 'uint256' },
                { internalType: 'address', name: 'token', type: 'address' },
              ],
              internalType: 'struct CommonExtData',
              name: '_externalData',
              type: 'tuple',
            },
            {
              components: [
                { internalType: 'bytes', name: 'roots', type: 'bytes' },
                {
                  internalType: 'bytes',
                  name: 'extensionRoots',
                  type: 'bytes',
                },
                {
                  internalType: 'uint256[]',
                  name: 'inputNullifiers',
                  type: 'uint256[]',
                },
                {
                  internalType: 'uint256[2]',
                  name: 'outputCommitments',
                  type: 'uint256[2]',
                },
                {
                  internalType: 'uint256',
                  name: 'publicAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'extDataHash',
                  type: 'uint256',
                },
              ],
              internalType: 'struct PublicInputs',
              name: '_publicInputs',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'bytes',
                  name: 'encryptedOutput1',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'encryptedOutput2',
                  type: 'bytes',
                },
              ],
              internalType: 'struct Encryptions',
              name: '_encryptions',
              type: 'tuple',
            },
          ],
          name: 'registerAndTransact',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          name: 'roots',
          outputs: [
            { internalType: 'uint256', name: 'root', type: 'uint256' },
            { internalType: 'uint32', name: 'latestLeafindex', type: 'uint32' },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'address', name: '_handler', type: 'address' },
            { internalType: 'uint32', name: '_nonce', type: 'uint32' },
          ],
          name: 'setHandler',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'address', name: '_verifier', type: 'address' },
            { internalType: 'uint32', name: '_nonce', type: 'uint32' },
          ],
          name: 'setVerifier',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'token',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'bytes', name: '_proof', type: 'bytes' },
            { internalType: 'bytes', name: '_auxPublicInputs', type: 'bytes' },
            {
              components: [
                { internalType: 'address', name: 'recipient', type: 'address' },
                { internalType: 'int256', name: 'extAmount', type: 'int256' },
                { internalType: 'address', name: 'relayer', type: 'address' },
                { internalType: 'uint256', name: 'fee', type: 'uint256' },
                { internalType: 'uint256', name: 'refund', type: 'uint256' },
                { internalType: 'address', name: 'token', type: 'address' },
              ],
              internalType: 'struct CommonExtData',
              name: '_externalData',
              type: 'tuple',
            },
            {
              components: [
                { internalType: 'bytes', name: 'roots', type: 'bytes' },
                {
                  internalType: 'bytes',
                  name: 'extensionRoots',
                  type: 'bytes',
                },
                {
                  internalType: 'uint256[]',
                  name: 'inputNullifiers',
                  type: 'uint256[]',
                },
                {
                  internalType: 'uint256[2]',
                  name: 'outputCommitments',
                  type: 'uint256[2]',
                },
                {
                  internalType: 'uint256',
                  name: 'publicAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'extDataHash',
                  type: 'uint256',
                },
              ],
              internalType: 'struct PublicInputs',
              name: '_publicInputs',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'bytes',
                  name: 'encryptedOutput1',
                  type: 'bytes',
                },
                {
                  internalType: 'bytes',
                  name: 'encryptedOutput2',
                  type: 'bytes',
                },
              ],
              internalType: 'struct Encryptions',
              name: '_encryptions',
              type: 'tuple',
            },
          ],
          name: 'transact',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256[8]', name: '_proof', type: 'uint256[8]' },
          ],
          name: 'unpackProof',
          outputs: [
            { internalType: 'uint256[2]', name: '', type: 'uint256[2]' },
            { internalType: 'uint256[2][2]', name: '', type: 'uint256[2][2]' },
            { internalType: 'uint256[2]', name: '', type: 'uint256[2]' },
          ],
          stateMutability: 'pure',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256', name: '_root', type: 'uint256' },
            { internalType: 'uint32', name: '_leafIndex', type: 'uint32' },
            {
              internalType: 'bytes32',
              name: '_srcResourceID',
              type: 'bytes32',
            },
          ],
          name: 'updateEdge',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'verifier',
          outputs: [
            {
              internalType: 'contract IAnchorVerifier',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ]}
    />
  ),
};
