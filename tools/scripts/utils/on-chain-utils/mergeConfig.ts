import { ConfigType } from '@webb-tools/dapp-config/types';
import merge from 'lodash/merge';
import { existsSync, readFileSync } from 'fs';

function mergeConfig(cfgPath: string, fetchedCfg: ConfigType): ConfigType {
  if (!existsSync(cfgPath)) {
    return fetchedCfg;
  }

  const content = readFileSync(cfgPath, { encoding: 'utf-8' });
  const localCfg = JSON.parse(content) as ConfigType;

  return merge(localCfg, fetchedCfg);
}

export default mergeConfig;
