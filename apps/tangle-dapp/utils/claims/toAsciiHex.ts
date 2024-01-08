export default function toAsciiHex(str: Uint8Array): Uint8Array {
  const arr: number[] = [];
  const pushNibble = (c: number) =>
    arr.push(
      c < 10
        ? c + 48 // 0
        : 97 - 10 + c // a
    );
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    pushNibble(str[i] / 16);
    pushNibble(str[i] % 16);
  }
  return new Uint8Array(arr);
}
