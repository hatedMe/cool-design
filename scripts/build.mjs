import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
for (const dir of ['es', 'lib']) await rm(new URL(`../${dir}/`, import.meta.url), { recursive: true, force: true });
await build();

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
  await writeFile(file, rewrite('.js'));
  const cjsFile = resolve(libRoot, relative(esRoot, file).replace(/\.d\.ts$/, '.d.cts'));
  await mkdir(dirname(cjsFile), { recursive: true });
  await writeFile(cjsFile, rewrite('.cjs'));
}
