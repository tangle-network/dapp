import { QueryParamConfig } from 'use-query-params';

const getParam = <TypeToEncode, TypeFromDecode = TypeToEncode>(
  params: URLSearchParams,
  key: string,
  ParamConfig: QueryParamConfig<TypeToEncode, TypeFromDecode>,
) => {
  const value = params.get(key);
  return ParamConfig.decode(value);
};

export default getParam;
