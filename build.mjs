import { build } from 'esbuild';
import { mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';

rmSync('pages-dist', { recursive: true, force: true });
mkdirSync('pages-dist', { recursive: true });
await build({
  entryPoints: ['entry.tsx'],
  bundle: true,
  minify: true,
  format: 'esm',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: 'pages-dist/birthday.js',
});
copyFileSync('index.html', 'pages-dist/index.html');
copyFileSync('public/favicon.svg', 'pages-dist/favicon.svg');
writeFileSync('pages-dist/.nojekyll', '');
console.log('Built into pages-dist/');
