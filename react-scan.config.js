export const enabled = true;

export const scanOptions = {
  components: true,
  hooks: true,
  context: true,
  propTypes: true,
};

export const output = {
  directory: './reports',
  detailed: true,
};

export const ignore = [
  'node_modules/**',
  'dist/**',
  '.git/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.stories.tsx',
  '**/*.stories.ts',
  '.next/**',
];
