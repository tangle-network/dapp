import { IVariableAnchorExtData } from '@webb-tools/interfaces';
import { FIELD_SIZE } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import ensureHex from './ensureHex';

const getVAnchorExtDataHash = (extData: IVariableAnchorExtData): bigint => {
  const abi = new ethers.utils.AbiCoder();
  const encodedData = abi.encode(
    [
      '(bytes recipient,int256 extAmount,bytes relayer,uint256 fee,uint256 refund,bytes token,bytes encryptedOutput1,bytes encryptedOutput2)',
    ],
    [extData]
  );

  const hash = ethers.utils.keccak256(encodedData);

  return BigInt(ensureHex(hash)) % FIELD_SIZE.toBigInt();
};

export default getVAnchorExtDataHash;
