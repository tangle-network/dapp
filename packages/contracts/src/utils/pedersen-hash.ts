const circomlib = require('tornado-circomlib');

export function pedersenHash(data: Uint8Array) {
  return circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];
}
