const JSONParseBigInt = (json: string) => {
  if (!json) return JSON.parse(json);

  const numbersBiggerThanMaxInt =
    /(?<=[^\\]":\n*\s*[[]?|[^\\]":\n*\s*\[.*[^.\d*]\n*\s*|(?<![^\\]"\n*\s*:\n*\s*[^\\]".*),\n*\s*)(-?\d{17,}|-?(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))(?=,(?!.*[^\\]"(\n*\s*\}|\n*\s*\]))|\n*\s*\}[^"]?|\n*\s*\][^"])/g;

  const serializedData = json.replace(numbersBiggerThanMaxInt, `"$1n"`);

  return JSON.parse(serializedData, (_, value) => {
    const isCustomFormatBigInt =
      typeof value === 'string' && Boolean(value.match(/^-?\d+n$/));

    if (isCustomFormatBigInt)
      return BigInt(value.substring(0, value.length - 1));

    return value;
  });
};

export default JSONParseBigInt;
