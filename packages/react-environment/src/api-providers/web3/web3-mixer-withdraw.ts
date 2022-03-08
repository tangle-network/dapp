import { parseUnits } from '@ethersproject/units';
import {
  chainTypeIdToInternalId,
  evmIdIntoInternalChainId,
  InternalChainId,
  parseChainIdType,
} from '@webb-dapp/apps/configs';
import { chainIdToRelayerName } from '@webb-dapp/apps/configs/relayer-config';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { depositFromPreimage } from '@webb-dapp/contracts/utils/make-deposit';
import { fromDepositIntoZKPTornPublicInputs } from '@webb-dapp/contracts/utils/zkp-adapters';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import {
  MixerWithdraw,
  OptionalActiveRelayer,
  OptionalRelayer,
  WithdrawState,
} from '@webb-dapp/react-environment/webb-context';
import { RelayedWithdrawResult, RelayerCMDBase, WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { LoggerService } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-core';
import { BigNumber } from 'ethers';

const logger = LoggerService.get('Web3MixerWithdraw');

export class Web3MixerWithdraw extends MixerWithdraw<WebbWeb3Provider> {
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
        const contractAddress = await this.inner.getTornadoContractAddressByNote(depositNote);

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
      chainId: chainTypeIdToInternalId(parseChainIdType(Number(evmNote.note.targetChainId))),
      tornadoSupport: {
        amount: Number(evmNote.note.amount),
        tokenSymbol: evmNote.note.tokenSymbol,
      },
    });
  }

  async getRelayersByChainAndAddress(chainId: InternalChainId, address: string) {
    return this.inner.relayingManager.getRelayer({
      baseOn: 'evm',
      chainId: chainId,
      contractAddress: address,
    });
  }

  get hasRelayer() {
    return this.relayers.then((r) => r.length > 0);
  }

  async withdraw(note: string, recipient: string): Promise<string> {
    this.cancelToken.cancelled = false;
    const activeRelayer = this.activeRelayer[0];
    const evmNote = await Note.deserialize(note);
    const deposit = depositFromPreimage(evmNote.note.secrets.replace('0x', ''));
    const chainEvmId = parseChainIdType(Number(evmNote.note.targetChainId)).chainId;
    const chainId = evmIdIntoInternalChainId(chainEvmId);

    this.emit('stateChange', WithdrawState.GeneratingZk);

    if (activeRelayer && (activeRelayer.beneficiary || activeRelayer.account)) {
      try {
        this.inner.notificationHandler({
          description: `Relaying withdraw through ${activeRelayer.endpoint}`,
          level: 'loading',
          message: 'evm-mixer:withdraw',
          name: 'Transaction',
          key: 'mixer-withdraw-evm',
        });

        logger.info(`Withdrawing through relayer with address ${activeRelayer.endpoint}`);
        logger.trace('Note deserialized', evmNote);
        const mixerInfo = this.inner.getMixerInfoBySize(Number(evmNote.note.amount), evmNote.note.tokenSymbol);
        logger.info(`Withdrawing to mixer info`, mixerInfo);
        const tornadoContract = await this.inner.getContractByAddress(mixerInfo.address);
        logger.trace('Generating the zkp');
        const fees = await activeRelayer.fees(note);
        const zkpInputWithoutMerkleProof = fromDepositIntoZKPTornPublicInputs(deposit, {
          recipient,
          relayer: activeRelayer.account ?? activeRelayer.beneficiary,
          fee: Number(fees?.totalFees),
        });

        const relayerLeaves = await activeRelayer.getLeaves(chainEvmId.toString(16), mixerInfo.address);

        // This is the part of withdraw that takes a long time
        this.emit('stateChange', WithdrawState.GeneratingZk);
        const zkp = await tornadoContract.generateZKPWithLeaves(
          deposit,
          zkpInputWithoutMerkleProof,
          relayerLeaves.leaves,
          relayerLeaves.lastQueriedBlock
        );

        logger.trace('Generated the zkp', zkp);

        // Check for cancelled here, abort if it was set.
        // Mark the withdraw mixer as able to withdraw again.
        if (this.cancelToken.cancelled) {
          this.inner.notificationHandler({
            description: 'Withdraw cancelled',
            level: 'error',
            message: 'evm-mixer:withdraw',
            name: 'Transaction',
            key: 'mixer-withdraw-evm',
          });
          this.emit('stateChange', WithdrawState.Ideal);
          return '';
        }

        this.emit('stateChange', WithdrawState.SendingTransaction);

        const relayedWithdraw = await activeRelayer.initWithdraw('tornadoRelayTx');
        logger.trace('initialized the withdraw WebSocket');
        const chainInput = {
          baseOn: 'evm' as RelayerCMDBase,
          name: chainIdToRelayerName(chainId),
          contractAddress: mixerInfo.address,
          endpoint: '',
        };
        const tx = relayedWithdraw.generateWithdrawRequest<typeof chainInput, 'tornadoRelayTx'>(chainInput, zkp.proof, {
          chain: chainIdToRelayerName(chainId),
          contract: mixerInfo.address,
          fee: bufferToFixed(zkp.input.fee),
          nullifierHash: bufferToFixed(zkp.input.nullifierHash),
          recipient: zkp.input.recipient,
          refund: bufferToFixed(zkp.input.refund),
          relayer: zkp.input.relayer,
          root: bufferToFixed(zkp.input.root),
        });
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
                level: 'success',
                message: 'evm-mixer:withdraw',
                name: 'Transaction',
                key: 'mixer-withdraw-evm',
              });

              break;
            case RelayedWithdrawResult.Errored:
              this.emit('stateChange', WithdrawState.Failed);
              this.emit('stateChange', WithdrawState.Ideal);

              this.inner.notificationHandler({
                description: message || 'Withdraw failed',
                level: 'error',
                message: 'evm-mixer:withdraw',
                name: 'Transaction',
                key: 'mixer-withdraw-evm',
              });

              break;
          }
        });
        logger.trace('Sending transaction');
        // stringify the request
        const data2 = JSON.stringify(tx);
        console.log(data2);
        relayedWithdraw.send(tx);
        const txHash = await relayedWithdraw.await();
        if (!txHash || !txHash[1]) {
          return '';
        }
        return txHash[1];
      } catch (e) {
        this.emit('stateChange', WithdrawState.Failed);
        this.emit('stateChange', WithdrawState.Ideal);
        logger.trace(e);

        this.inner.notificationHandler({
          description: 'Withdraw failed',
          level: 'error',
          message: 'evm-mixer:withdraw',
          name: 'Transaction',
          key: 'mixer-withdraw-evm',
        });

        if ((e as any)?.code === WebbErrorCodes.RelayerMisbehaving) {
          throw e;
        }
      }
    } else {
      logger.trace('Withdrawing without relayer');

      this.inner.notificationHandler({
        description: 'Withdraw In Progress',
        level: 'loading',
        message: 'evm-mixer:withdraw',
        name: 'Transaction',
        key: 'mixer-withdraw-evm',
      });

      const contract = await this.inner.getContractBySize(Number(evmNote.note.amount), evmNote.note.tokenSymbol);
      // Still retrieve supported relayers for leaf querying
      const relayers = await this.getRelayersByNote(evmNote);
      let zkp: any;
      const zkpInputWithoutMerkleProof = fromDepositIntoZKPTornPublicInputs(deposit, {
        recipient,
        relayer: recipient,
      });
      try {
        if (relayers.length) {
          try {
            const relayerLeaves = await relayers[0].getLeaves(chainEvmId.toString(16), contract.inner.address);
            zkp = await contract.generateZKPWithLeaves(
              deposit,
              zkpInputWithoutMerkleProof,
              relayerLeaves.leaves,
              relayerLeaves.lastQueriedBlock
            );
          } catch (e) {
            // If attempting to fetch leaves from the available relayer failed, query from chain.
            if ((e as any)?.code === WebbErrorCodes.RelayerMisbehaving) {
              zkp = await contract.generateZKP(deposit, zkpInputWithoutMerkleProof);
            } else {
              logger.log('error in web3 mixer withdraw: ', e);
              throw e;
            }
          }
        } else {
          // This is the part of withdraw that takes a long time
          zkp = await contract.generateZKP(deposit, zkpInputWithoutMerkleProof);
        }
        logger.trace('Generated the zkp', zkp);

        // Check for cancelled here, abort if it was set.
        // Mark the withdraw mixer as able to withdraw again.
        if (this.cancelToken.cancelled) {
          this.inner.notificationHandler({
            description: 'Withdraw canceled',
            level: 'error',
            message: 'evm-mixer:withdraw',
            name: 'Transaction',
            key: 'mixer-withdraw-evm',
          });
          this.emit('stateChange', WithdrawState.Ideal);
          return '';
        }

        this.emit('stateChange', WithdrawState.SendingTransaction);
        const txReset = await contract.withdraw(zkp.proof, zkp.input);
        const receipt = await txReset.wait();

        this.inner.notificationHandler({
          description: 'Withdraw success',
          level: 'success',
          message: 'evm-mixer:withdraw',
          name: 'Transaction',
          key: 'mixer-withdraw-evm',
        });

        this.emit('stateChange', WithdrawState.Ideal);
        return receipt.transactionHash;
      } catch (e) {
        // todo fix this and fetch the error from chain

        // User rejected transaction from provider
        if ((e as any)?.code === 4001) {
          this.inner.notificationHandler({
            description: 'Withdraw Rejected',
            level: 'error',
            message: 'evm-mixer:withdraw',
            name: 'Transaction',
            key: 'mixer-withdraw-evm',
          });

          this.emit('stateChange', WithdrawState.Ideal);
          return '';
        }
        this.inner.notificationHandler({
          description: 'Withdraw Failed',
          level: 'error',
          message: 'evm-mixer:withdraw',
          name: 'Transaction',
          key: 'mixer-withdraw-evm',
        });
        throw e;
      }
    }
    return '';
  }
}
