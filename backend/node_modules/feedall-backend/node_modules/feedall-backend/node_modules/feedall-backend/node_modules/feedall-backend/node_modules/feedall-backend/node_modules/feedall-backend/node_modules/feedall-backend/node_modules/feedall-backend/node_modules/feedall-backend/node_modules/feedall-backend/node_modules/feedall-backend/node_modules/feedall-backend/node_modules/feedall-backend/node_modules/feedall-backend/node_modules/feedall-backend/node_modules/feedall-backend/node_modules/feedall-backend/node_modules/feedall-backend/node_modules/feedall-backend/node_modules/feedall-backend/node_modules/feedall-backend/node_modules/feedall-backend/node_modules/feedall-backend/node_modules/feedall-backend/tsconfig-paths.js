import { compilerOptions } from './tsconfig.json';
import { register } from 'tsconfig-paths';

const baseUrl = './'; // Either absolute or relative path. If relative it's resolved to current working directory.
const cleanup = register({
  baseUrl,
  paths: compilerOptions.paths,
});
