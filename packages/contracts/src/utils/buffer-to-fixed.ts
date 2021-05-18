const snarkjs = require('snarkjs');
const bigInt = snarkjs.bigInt;
export const bufferToFixed = (number: Buffer | any, length = 32) =>
  '0x' + (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0');