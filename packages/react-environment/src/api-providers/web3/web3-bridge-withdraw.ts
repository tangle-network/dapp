import { parseUnits } from '@ethersproject/units';
import {
  chainTypeIdToInternalId,
  evmIdIntoInternalChainId,
  getAnchorAddressForBridge,
  getEVMChainName,
  getEVMChainNameFromInternal,
  InternalChainId,
  parseChainIdType,
  webbCurrencyIdFromString,
} from '@webb-dapp/apps/configs';
import { chainIdToRelayerName } from '@webb-dapp/apps/configs/relayer-config';
import {
  anchorDeploymentBlock,
  bridgeCurrencyBridgeStorageFactory,
  MixerStorage,
} from '@webb-dapp/apps/configs/storages';
import { AnchorContract } from '@webb-dapp/contracts/contracts';
import { generateWithdrawProofCallData, hexStringToBytes } from '@webb-dapp/contracts/utils/bridge-utils';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { depositFromAnchorNote } from '@webb-dapp/contracts/utils/make-deposit';
import { Bridge, RelayedWithdrawResult, RelayerCMDBase, WebbRelayer } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import {
  BridgeWithdraw,
  OptionalActiveRelayer,
  OptionalRelayer,
  WithdrawState,
} from '@webb-dapp/react-environment/webb-context';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { LoggerService } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-core';
import { JsNote as DepositNote } from '@webb-tools/wasm-utils';
import { BigNumber } from 'ethers';

const logger = LoggerService.get('Web3BridgeWithdraw');

export class Web3BridgeWithdraw extends BridgeWithdraw<WebbWeb3Provider> {
  private get config() {
    return this.inner.config;
  }
  async mapRelayerIntoActive(relayer: OptionalRelayer): Promise<OptionalActiveRelayer> {
    if (!relayer) {
      return null;
    }
    const evmId = await this.inner.getChainId();
    const chainId = evmIdIntoInternalChainId(evmId);
    return WebbRelayer.intoActiveWebRelayer(
      relayer,
      {
        basedOn: 'evm',
        chain: chainId,
      },
      // Define the function for retrieving fee information for the relayer
      async (note: string) => {
        const depositNote = await Note.deserialize(note);
        const evmNote = depositNote.note;
        const contractAddress = await getAnchorAddressForBridge(
          webbCurrencyIdFromString(evmNote.tokenSymbol),
          Number(evmNote.targetChainId),
          Number(evmNote.amount)
        );

        if (!contractAddress) {
          throw new Error('Unsupported configuration for bridge');
        }

        // Given the note, iterate over the relayer's supported contracts and find the corresponding configuration
        // for the contract.
        const supportedContract = relayer.capabilities.supportedChains['evm']
          .get(Number(evmNote.targetChainId))
          ?.contracts.find(({ address, size }) => {
            // Match on the relayer configuration as well as note
            return address.toLowerCase() === contractAddress.toLowerCase() && size == Number(evmNote.amount);
          });

        // The user somehow selected a relayer which does not support the mixer.
        // This should not be possible as only supported mixers should be selectable in the UI.
        if (!supportedContract) {
          throw WebbError.from(WebbErrorCodes.RelayerUnsupportedMixer);
        }

        const principleBig = parseUnits(supportedContract.size.toString(), evmNote.denomination);
        const withdrawFeeMill = supportedContract.withdrawFeePercentage * 1000000;

        const withdrawFeeMillBig = BigNumber.from(withdrawFeeMill);
        const feeBigMill = principleBig.mul(withdrawFeeMillBig);

        const feeBig = feeBigMill.div(BigNumber.from(1000000));
        return {
          totalFees: feeBig.toString(),
          withdrawFeePercentage: supportedContract.withdrawFeePercentage,
        };
      }
    );
  }

  async getRelayersByChainAndAddress(chainId: InternalChainId, address: string) {
    return this.inner.relayingManager.getRelayer({
      baseOn: 'evm',
      chainId: chainId,
      contractAddress: address,
    });
  }

  get relayers() {
    return this.inner.getChainId().then((evmId) => {
      const chainId = evmIdIntoInternalChainId(evmId);
      return this.inner.relayingManager.getRelayer({
        baseOn: 'evm',
        chainId,
      });
    });
  }

  async getRelayersByNote(evmNote: Note) {
    return this.inner.relayingManager.getRelayer({
      baseOn: 'evm',
      chainId: Number(evmNote.note.targetChainId),
      bridgeSupport: {
        amount: Number(evmNote.note.amount),
        tokenSymbol: evmNote.note.tokenSymbol,
      },
    });
  }

  async sameChainWithdraw(note: DepositNote, recipient: string): Promise<string> {
    this.cancelToken.cancelled = false;

    const bridgeCurrencyId = webbCurrencyIdFromString(note.tokenSymbol);
    const bridge = Bridge.from(bridgeCurrencyId, this.inner.config.bridgeByAsset);

    const activeChain = await this.inner.getChainId();
    const internalId = evmIdIntoInternalChainId(activeChain);

    const contractAddresses = bridge.anchors.find((anchor) => anchor.amount === note.amount)!;
    const contractAddress = contractAddresses.anchorAddresses[internalId]!;

    const contract = this.inner.getWebbAnchorByAddress(contractAddress);
    const accounts = await this.inner.accounts.accounts();
    const account = accounts[0];

    const deposit = depositFromAnchorNote(note);
    logger.info(`Commitment for withdraw is ${deposit.commitment}`);

    const input = {
      destinationChainId: activeChain,
      secret: deposit.secret,
      nullifier: deposit.nullifier,
      nullifierHash: deposit.nullifierHash,

      // Todo change this to the RELAYER address
      relayer: account.address,
      recipient: account.address,

      fee: 0,
      refund: 0,
    };

    logger.trace(`input for zkp`, input);
    const section = `Bridge ${bridge.currency.getChainIds().map(getEVMChainNameFromInternal).join('-')}`;
    const key = `web3-bridge-withdraw`;
    this.emit('stateChange', WithdrawState.GeneratingZk);
    const zkpResults = await contract.generateZKP(deposit, input);
    this.inner.notificationHandler({
      description: 'Withdraw in progress',
      key,
      level: 'loading',
      message: `${section}:withdraw`,
      name: 'Transaction',
    });
    // Check for cancelled here, abort if it was set.
    if (this.cancelToken.cancelled) {
      this.inner.notificationHandler({
        description: 'Withdraw canceled',
        key,
        level: 'error',
        message: `${section}:withdraw`,
        name: 'Transaction',
      });
      this.emit('stateChange', WithdrawState.Ideal);
      return '';
    }

    let txHash: string;

    this.emit('stateChange', WithdrawState.SendingTransaction);
    try {
      txHash = await contract.withdraw(
        zkpResults.proof,
        {
          destinationChainId: Number(note.targetChainId),
          fee: input.fee,
          nullifier: input.nullifier,
          nullifierHash: input.nullifierHash,
          pathElements: zkpResults.input.pathElements,
          pathIndices: zkpResults.input.pathIndices,
          recipient: input.recipient,
          refund: input.refund,
          relayer: input.relayer,
          root: zkpResults.root as any,
          secret: zkpResults.input.secret,
        },
        zkpResults.input
      );
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);

      this.inner.notificationHandler({
        description: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
        key,
        level: 'error',
        message: `${section}:withdraw`,
        name: 'Transaction',
      });
      return '';
    }

    this.emit('stateChange', WithdrawState.Ideal);
    this.inner.notificationHandler({
      description: recipient,
      key,
      level: 'success',
      message: `${section}:withdraw`,
      name: 'Transaction',
    });
    return '';
  }

  async crossChainWithdraw(note: DepositNote, recipient: string) {
    this.cancelToken.cancelled = false;
    const bridgeStorageStorage = await bridgeCurrencyBridgeStorageFactory();

    // Setup a provider for the source chain
    const sourceChainIdType = parseChainIdType(Number(note.sourceChainId));
    const sourceEvmId = sourceChainIdType.chainId;
    const sourceInternalId = evmIdIntoInternalChainId(sourceEvmId);
    const sourceChainConfig = this.config.chains[sourceInternalId];
    const rpc = sourceChainConfig.url;
    const sourceHttpProvider = Web3Provider.fromUri(rpc);
    const sourceEthers = sourceHttpProvider.intoEthersProvider();

    // get info from the destination chain (should be selected)
    const destChainIdType = parseChainIdType(Number(note.targetChainId));
    const destInternalId = chainTypeIdToInternalId(destChainIdType);

    // get the deposit info
    const sourceDeposit = depositFromAnchorNote(note);
    this.emit('stateChange', WithdrawState.GeneratingZk);

    // Getting contracts data for source and dest chains
    const bridgeCurrency = this.inner.methods.bridgeApi.currency;
    // await this.inner.methods.bridgeApi.setActiveBridge()
    const availableAnchors = await this.inner.methods.bridgeApi.getAnchors();
    const selectedAnchor = availableAnchors.find((anchor) => anchor.amount == note.amount);
    const destContractAddress = selectedAnchor?.neighbours[destInternalId]! as string;
    const sourceContractAddress = selectedAnchor?.neighbours[sourceInternalId]! as string;

    const activeChain = await this.inner.getChainId();

    // get root and neighbour root from the dest provider
    const destAnchor = this.inner.getWebbAnchorByAddress(destContractAddress);

    // Building the merkle proof
    const sourceContract = this.inner.getWebbAnchorByAddressAndProvider(sourceContractAddress, sourceEthers);
    const sourceLatestRoot = await sourceContract.inner.getLastRoot();
    logger.trace(`Source latest root ${sourceLatestRoot}`);

    // get relayers for the source chain
    const sourceRelayers = this.inner.relayingManager.getRelayer({
      chainId: chainTypeIdToInternalId(parseChainIdType(Number(note.sourceChainId))),
      baseOn: 'evm',
      bridgeSupport: {
        amount: Number(note.amount),
        tokenSymbol: note.tokenSymbol,
      },
    });

    let leaves: string[] = [];

    // loop through the sourceRelayers to fetch leaves
    for (let i = 0; i < sourceRelayers.length; i++) {
      const relayerLeaves = await sourceRelayers[i].getLeaves(sourceEvmId.toString(16), sourceContractAddress);

      const validLatestLeaf = await sourceContract.leafCreatedAtBlock(
        relayerLeaves.leaves[relayerLeaves.leaves.length - 1],
        relayerLeaves.lastQueriedBlock
      );

      console.log('validLatestLeaf: ', validLatestLeaf);

      // leaves from relayer somewhat validated, attempt to build the tree
      if (validLatestLeaf) {
        const tree = AnchorContract.createTreeWithRoot(relayerLeaves.leaves, sourceLatestRoot);

        // If we were able to build the tree, set local storage and break out of the loop
        if (tree) {
          console.log('tree valid, using relayer leaves');
          leaves = relayerLeaves.leaves;

          await bridgeStorageStorage.set(sourceContract.inner.address.toLowerCase(), {
            lastQueriedBlock: relayerLeaves.lastQueriedBlock,
            leaves: relayerLeaves.leaves,
          });
          break;
        }
      }
    }

    // if we weren't able to get leaves from the relayer, get them directly from chain
    if (!leaves.length) {
      // check if we already cached some values
      const storedContractInfo: MixerStorage[0] = (await bridgeStorageStorage.get(
        sourceContractAddress.toLowerCase()
      )) || {
        lastQueriedBlock: anchorDeploymentBlock[sourceContractAddress.toLowerCase()] || 0,
        leaves: [] as string[],
      };

      const leavesFromChain = await sourceContract.getDepositLeaves(storedContractInfo.lastQueriedBlock + 1, 0);

      leaves = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves];
    }

    // generate the merkle proof
    const merkleProof = await destAnchor.generateLinkedMerkleProof(sourceDeposit, leaves, sourceEvmId);
    if (!merkleProof) {
      this.emit('stateChange', WithdrawState.Ideal);
      throw new Error('Failed to generate Merkle proof');
    }

    // Check for cancelled here, abort if it was set.
    if (this.cancelToken.cancelled) {
      this.inner.notificationHandler({
        description: 'Withdraw cancelled',
        key: 'mixer-withdraw-evm',
        message: 'bridge:withdraw',
        name: 'Transaction',
        level: 'error',
      });
      this.emit('stateChange', WithdrawState.Ideal);
      return '';
    }

    const accounts = await this.inner.accounts.accounts();
    const account = accounts[0];

    this.emit('stateChange', WithdrawState.SendingTransaction);
    let txHash: string;
    const activeRelayer = this.activeRelayer[0];

    if (activeRelayer && (activeRelayer.account || activeRelayer.beneficiary)) {
      logger.log(`withdrawing through relayer`);
      const input = {
        destinationChainId: Number(note.targetChainId),
        secret: sourceDeposit.secret,
        nullifier: sourceDeposit.nullifier,
        nullifierHash: sourceDeposit.nullifierHash,

        relayer: activeRelayer.beneficiary ? activeRelayer.beneficiary : activeRelayer.account!,
        recipient: recipient,
        fee: 0,
        refund: 0,
      };

      let zkp;
      try {
        zkp = await destAnchor.merkleProofToZKP(merkleProof, sourceEvmId, sourceDeposit, input);
      } catch (e) {
        console.log(e);
        this.emit('stateChange', WithdrawState.Ideal);

        this.inner.notificationHandler({
          description: 'Deposit not yet available',
          key: 'mixer-withdraw-evm',
          message: 'bridge:withdraw',
          name: 'Transaction',
          level: 'error',
        });

        return '';
      }

      // convert the proof to solidity calldata
      const proofBytes = await generateWithdrawProofCallData(zkp.proof, zkp.input);

      // convert the roots into the format the relayer expects
      const roots = zkp.input.roots.map((root: string) => {
        return root.substr(2);
      });
      const relayerRootString = roots.join('');
      const relayerRootsBytes = hexStringToBytes(relayerRootString);
      const relayerRoots = Array.from(relayerRootsBytes);

      const relayedWithdraw = await activeRelayer.initWithdraw('anchorRelayTx');
      logger.trace('initialized the withdraw WebSocket');

      const chainInfo = {
        baseOn: 'evm' as RelayerCMDBase,
        name: chainIdToRelayerName(destInternalId),
        contractAddress: destContractAddress,
        endpoint: '',
      };

      const tx = relayedWithdraw.generateWithdrawRequest<typeof chainInfo, 'anchorRelayTx'>(
        chainInfo,
        `0x${proofBytes}`,
        {
          fee: bufferToFixed(zkp.input.fee),
          nullifierHash: bufferToFixed(zkp.input.nullifierHash),
          chain: chainInfo.name,
          contract: chainInfo.contractAddress,
          refreshCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
          recipient: zkp.input.recipient,
          refund: bufferToFixed(zkp.input.refund),
          relayer: zkp.input.relayer,
          roots: relayerRoots,
        }
      );
      relayedWithdraw.watcher.subscribe(([nextValue, message]) => {
        switch (nextValue) {
          case RelayedWithdrawResult.PreFlight:
          case RelayedWithdrawResult.OnFlight:
            this.emit('stateChange', WithdrawState.SendingTransaction);
            break;
          case RelayedWithdrawResult.Continue:
            break;
          case RelayedWithdrawResult.CleanExit:
            this.emit('stateChange', WithdrawState.Done);
            this.emit('stateChange', WithdrawState.Ideal);

            this.inner.notificationHandler({
              description: 'Withdraw success',
              key: 'mixer-withdraw-evm',
              message: 'bridge:withdraw',
              name: 'Transaction',
              level: 'success',
            });

            break;
          case RelayedWithdrawResult.Errored:
            this.emit('stateChange', WithdrawState.Failed);
            this.emit('stateChange', WithdrawState.Ideal);

            this.inner.notificationHandler({
              description: message || 'Withdraw failed',
              key: 'mixer-withdraw-evm',
              message: 'bridge:withdraw',
              name: 'Transaction',
              level: 'error',
            });

            break;
        }
      });
      logger.trace('Sending transaction');
      // stringify the request
      const data = JSON.stringify(tx);
      console.log(data);

      relayedWithdraw.send(tx);
      const txResult = await relayedWithdraw.await();
      if (!txResult || !txResult[1]) {
        return '';
      }
      txHash = txResult[1];
    } else {
      try {
        logger.log(`withdrawing without relayer`);

        const input = {
          destinationChainId: Number(note.targetChainId),
          secret: sourceDeposit.secret,
          nullifier: sourceDeposit.nullifier,
          nullifierHash: sourceDeposit.nullifierHash,
          // Todo change this to the realyer address
          relayer: account.address,
          recipient: recipient,

          fee: 0,
          refund: 0,
        };

        let zkpResults;
        try {
          zkpResults = await destAnchor.merkleProofToZKP(merkleProof, sourceEvmId, sourceDeposit, input);
        } catch (e) {
          console.log(e);
          this.emit('stateChange', WithdrawState.Ideal);

          this.inner.notificationHandler({
            description: 'Deposit not yet available',
            key: 'mixer-withdraw-evm',
            message: 'bridge:withdraw',
            name: 'Transaction',
            level: 'error',
          });

          return '';
        }
        txHash = await destAnchor.withdraw(
          zkpResults.proof,
          {
            destinationChainId: activeChain,
            fee: input.fee,
            nullifier: input.nullifier,
            nullifierHash: input.nullifierHash,
            pathElements: zkpResults.input.pathElements,
            pathIndices: zkpResults.input.pathIndices,
            recipient: input.recipient,
            refund: input.refund,
            relayer: input.relayer,
            root: zkpResults.root as any,
            secret: zkpResults.input.secret,
          },
          zkpResults.input
        );
      } catch (e) {
        this.emit('stateChange', WithdrawState.Ideal);
        this.inner.notificationHandler({
          message: `Bridge ${bridgeCurrency?.getChainIds().map(getEVMChainNameFromInternal).join('-')}:withdraw`,
          description: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
          key: 'bridge-withdraw-evm',
          level: 'error',
          name: 'Transaction',
        });
        return '';
      }
    }

    this.inner.notificationHandler({
      message: `Bridge ${bridgeCurrency?.getChainIds().map(getEVMChainNameFromInternal).join('-')}:withdraw`,
      description: 'Withdraw done',
      key: 'bridge-withdraw-evm',
      level: 'success',
      name: 'Transaction',
    });

    this.emit('stateChange', WithdrawState.Done);
    this.emit('stateChange', WithdrawState.Ideal);
    return txHash;
  }

  async withdraw(note: string, recipient: string): Promise<string> {
    logger.trace(`Withdraw using note ${note} , recipient ${recipient}`);

    const parseNote = await Note.deserialize(note);
    const depositNote = parseNote.note;
    const sourceChainName = getEVMChainName(parseChainIdType(Number(depositNote.sourceChainId)).chainId);
    const targetChainName = getEVMChainName(parseChainIdType(Number(depositNote.targetChainId)).chainId);
    logger.trace(`Bridge withdraw from ${sourceChainName} to ${targetChainName}`);

    if (depositNote.sourceChainId === depositNote.targetChainId) {
      logger.trace(`Same chain flow ${sourceChainName}`);
      return this.sameChainWithdraw(depositNote, recipient);
    } else {
      logger.trace(`cross chain flow ${sourceChainName} ----> ${targetChainName}`);
      return this.crossChainWithdraw(depositNote, recipient);
    }
  }
}
