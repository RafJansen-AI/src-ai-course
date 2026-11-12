// Turns dist-single/index.html into a page body that can be published as a claude.ai Artifact preview.
// Usage: npm run build:preview && node scripts/make-preview.mjs <out.html>
import { readFileSync, writeFileSync } from 'node:fs';
let h = readFileSync('dist-single/index.html', 'utf8');
h = h.replace(/<!doctype html>\s*/i, '')
  .replace(/<\/?(html|head|body)[^>]*>/g, '')
  .replace(/<meta charset[^>]*>\s*/, '')
  .replace(/<meta name="viewport"[^>]*>\s*/, '')
  .replaceAll('�', '\\uFFFD');
writeFileSync(process.argv[2] || 'dist-single/preview.html', h.trim() + '\n');
