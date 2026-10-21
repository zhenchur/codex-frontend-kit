import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (['.git', 'node_modules', '.test-output'].includes(e.name)) return [];
    const full = path.join(dir, e.name);
    if (e.isSymbolicLink()) throw new Error('Manifest does not allow symlinks');
    return e.isDirectory() ? walk(full) : [full];
  });
}
const files = walk(root).map(full => ({ full, relative: path.relative(root, full).split(path.sep).join('/') }))
  .filter(f => !['manifest.json', '.gitignore', '.gitattributes'].includes(f.relative) && !/\.(zip|tgz)$/.test(f.relative))
  .sort((a,b) => a.relative.localeCompare(b.relative)).map(({ full, relative }) => {
    const bytes = fs.readFileSync(full);
    const snapshot = relative.match(/^(?:optional-)?skills\/(?!frontend-react-workflow\/)(.+)$/);
    return { path: relative, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      source: snapshot ? 'bundled skill; provenance in THIRD-PARTY-NOTICES.md: ' + snapshot[1] : 'authored frontend workflow',
      version: snapshot ? 'snapshot identified by SHA-256' : '2.0.0' };
  });
fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify({ schemaVersion: 1, createdDate: '2026-10-21', kitVersion: '2.0.0', files }, null, 2) + '\n');
console.log(`Manifest: ${files.length} files`);
