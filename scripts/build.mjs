import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { buildStyles } from './build-styles.mjs';
for (const dir of ['es', 'lib']) await rm(new URL(`../${dir}/`, import.meta.url), { recursive: true, force: true });
const [esm] = await build();
const defaultExports = new Set(esm.output
  .filter(chunk => chunk.type === 'chunk' && chunk.exports.includes('default'))
  .map(chunk => chunk.fileName));
const require = createRequire(import.meta.url);
execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'scripts/declarations'], { stdio: 'inherit' });

// NodeNext 要求 ESM 声明带扩展名，CommonJS 使用独立的 .d.cts 声明。
const esRoot = fileURLToPath(new URL('../es/', import.meta.url));
const libRoot = fileURLToPath(new URL('../lib/', import.meta.url));
async function declarations(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await declarations(path)));
    else if (entry.name.endsWith('.d.ts')) result.push(path);
  }
  return result;
}
const files = await declarations(esRoot);
const available = new Set(files);
for (const file of files) {
  const source = await readFile(file, 'utf8');
  function rewrite(extension) {
    return source.replace(/(['"])(\.[^'"\n]+)\1/g, (match, quote, specifier) => {
      const base = resolve(dirname(file), specifier);
      const target = [`${base}.d.ts`, resolve(base, 'index.d.ts')].find((path) => available.has(path));
      if (!target) return match;
      let path = relative(dirname(file), target)
        .replaceAll('\\', '/')
        .replace(/\.d\.ts$/, extension);
      if (!path.startsWith('.')) path = `./${path}`;
      return `${quote}${path}${quote}`;
    });
  }
  const cjsFile = resolve(libRoot, relative(esRoot, file).replace(/\.d\.ts$/, '.d.cts'));
  await mkdir(dirname(cjsFile), { recursive: true });
  await writeFile(cjsFile, rewrite('.cjs'));
  const name = relative(esRoot, file).replaceAll('\\', '/');
  if (/^packages\/cool-design\/(?:(?:[^/]+\/)?index|hooks)\.d\.ts$/.test(name)) {
    // 两种模块格式共享组件类型及全局声明。
    const target = relative(dirname(file), cjsFile).replaceAll('\\', '/').replace(/\.d\.cts$/, '.cjs');
    const lines = [`export * from '${target}';`];
    if (defaultExports.has(name.replace(/\.d\.ts$/, '.js'))) {
      lines.push(`declare const component: typeof import('${target}').default;`, 'export default component;');
    }
    if (name === 'packages/cool-design/index.d.ts') {
      lines.push(`import type { RegisteredComponents, RegisteredServices } from '${target.replace(/index\.cjs$/, 'global-types.cjs')}';`,
        "declare module 'vue' {", '  interface GlobalComponents extends RegisteredComponents {}',
        '  interface ComponentCustomProperties extends RegisteredServices {}', '}');
    }
    await writeFile(file, lines.join('\n') + '\n');
  } else {
    await writeFile(file, rewrite('.js'));
  }
}

const entries = files.filter((file) => /^packages\/cool-design\/[^/]+\/index\.d\.ts$/.test(
  relative(esRoot, file).replaceAll('\\', '/')
)).map((file) => relative(esRoot, dirname(file)).split(/[\\/]/).pop());
await buildStyles(entries, [esRoot, libRoot]);
