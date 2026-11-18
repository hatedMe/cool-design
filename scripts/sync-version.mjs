// 发版时将 package.json 的版本号同步进主入口的内联字面量。
// 用法：node scripts/sync-version.mjs <version>
import { readFile, writeFile } from 'node:fs/promises';

const version = process.argv[2];
if (!version) {
  throw new Error('usage: node scripts/sync-version.mjs <version>');
}
const file = new URL('../packages/cool-design/index.ts', import.meta.url);
const source = await readFile(file, 'utf8');
const pattern = /export const version: string = '[^']*'/;
if (!pattern.test(source)) {
  throw new Error('version export not found in packages/cool-design/index.ts');
}
await writeFile(file, source.replace(pattern, `export const version: string = '${version}'`));
