export const useClientCache = (key: string) => {
  if (typeof window === 'undefined') {
    return [undefined, () => {}];
  }
  const formatedKey = `WEBB_l${key}`;
  const value = localStorage.getItem(`nf_loc`);
  const parse = value ? JSON.parse(value) : {};
  return [
    parse[formatedKey],
    (next) => {
      const value = localStorage.getItem(`nf_loc`);
      const parse = value ? JSON.parse(value) : {};
      if (!next) {
        delete parse[formatedKey];
        return localStorage.setItem(
          'nf_loc',
          JSON.stringify({
            ...parse,
            [formatedKey]: next,
          })
        );
      }
      localStorage.setItem(
        'nf_loc',
        JSON.stringify({
          ...parse,
          [formatedKey]: next,
        })
      );
    },
  ];
};

const get = (key: string) => {
  const formatedKey = `WEBB_l${key}`;
  const value = localStorage.getItem(`nf_loc`);
  const parse = value ? JSON.parse(value) : {};
  return parse[formatedKey];
};
const store = (key: string, next: string) => {
  const formatedKey = `WEBB_l${key}`;
  const value = localStorage.getItem(`nf_loc`);
  const parse = value ? JSON.parse(value) : {};
  localStorage.setItem(
    'nf_loc',
    JSON.stringify({
      ...parse,
      [formatedKey]: next,
    })
  );
};
export const getStore = {
  get,
  store,
};
