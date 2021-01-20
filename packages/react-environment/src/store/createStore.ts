import { useState, Dispatch, SetStateAction, useRef, useCallback, MutableRefObject } from 'react';

export interface ManipulationParams<T> {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  stateRef: MutableRefObject<T>;
}

export type ManipulationsConfig<T> = Record<string, (params: ManipulationParams<T>) => (...params: any[]) => any>;

type MapManipulation<T, M extends ManipulationsConfig<T>> = {
  [k in keyof M]: ReturnType<M[k]>
};

type CreateStoreReturnType<T, M extends ManipulationsConfig<T>, R = MapManipulation<T, M>> = {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  stateRef: MutableRefObject<T>;
} & R;

export function createStore<T, M extends ManipulationsConfig<T>> (initializeStore: T, manipulations: M) {
  return (): CreateStoreReturnType<T, M> => {
    // use useState to initialize a store
    const [state, _setState] = useState<T>(initializeStore);
    const stateRef = useRef<T>(initializeStore);

    const setState = useCallback((value: any): void => {
      // update stateRef first
      stateRef.current = value;

      // update state
      _setState(value);
    }, [_setState]);

    const _manipulates: MapManipulation<T, M> = {} as any;

    // generate manipulates
    Object.keys(manipulations).forEach((key: keyof M) => {
      (_manipulates as any)[key] = manipulations[key]({
        setState,
        state,
        stateRef
      });
    });

    return {
      setState,
      state,
      stateRef,
      ..._manipulates
    } as CreateStoreReturnType<T, M>;
  };
}
