import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const publicDir = path.join(projectRoot, 'public');

const copies = [
  { from: 'build/pdf.worker.min.mjs', to: 'pdf.worker.min.mjs', recursive: false },
  { from: 'wasm', to: 'wasm', recursive: true },
  { from: 'cmaps', to: 'cmaps', recursive: true },
  { from: 'standard_fonts', to: 'standard_fonts', recursive: true },
];

for (const { from, to, recursive } of copies) {
  const src = path.join(pdfjsDistPath, from);
  const dest = path.join(publicDir, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive });
  console.log(`Copied pdfjs-dist/${from} -> public/${to}`);
}
