const isBrowser = (windowArg?: Window) => {
  const window = windowArg ?? globalThis.window;

  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
};

export default isBrowser;
