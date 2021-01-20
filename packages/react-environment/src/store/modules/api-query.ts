import { createStore, ManipulationsConfig, ManipulationParams } from '../createStore';

type ApiQueryStoreState = Record<string, any>;

interface ApiQueryStoreManipulate<T = ApiQueryStoreState> extends ManipulationsConfig<T> {
  get: (params: ManipulationParams<T>) => (key: string) => any;
  set: (params: ManipulationParams<T>) => (key: string, value: any) => void;
}

export const useApiQueryStore = createStore<ApiQueryStoreState, ApiQueryStoreManipulate<ApiQueryStoreState>>({}, {
  get: ({ state }) => (key: string): any => {
    return state[key];
  },
  set: ({ setState, stateRef }) => (key: string, value: any): void => {
    // update query result
    setState({
      ...stateRef.current,
      [key]: value
    });
  }
});
