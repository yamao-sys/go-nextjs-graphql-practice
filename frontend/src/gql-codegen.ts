import { CodegenConfig } from '@graphql-codegen/cli';
const config: CodegenConfig = {
  overwrite: true,
  schema: ['graph/**/*.graphqls'], // バックエンドgraphql schema定義ファイルを参照 (*1)
  documents: 'graphql/**/*.graphql',
  generates: {
    'graphql/__generated__/graphql-schema-types.ts': {
      plugins: ['typescript'],
    },
    'components/': {
      documents: 'app/**/*.tsx',
      preset: 'near-operation-file',
      plugins: ['typescript-operations', 'typescript-react-apollo'],
      presetConfig: {
        baseTypesPath: '../graphql/__generated__/graphql-schema-types.ts',
        folder: '__generated__',
        extension: '.ts',
        importTypesNamespace: 'SchemaTypes',
      },
    },
  },
  config: {
    namingConvention: {
      enumValues: 'change-case-all#upperCase',
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};
export default config;
