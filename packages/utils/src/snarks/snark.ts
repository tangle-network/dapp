type Snark = {
  groth16: {};
  powersOfTau: {};
  r1cs: {};
  wtns: {};
  zKey: {};
};

// @ts-ignore
export const snark = window.snarkjs as Snark;
