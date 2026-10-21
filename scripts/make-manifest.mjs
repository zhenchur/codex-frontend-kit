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
  .filter(f => !['manifest.json'].includes(f.relative) && !f.relative.endsWith('.zip'))
  .sort((a,b) => a.relative.localeCompare(b.relative)).map(({ full, relative }) => {
    const bytes = fs.readFileSync(full);
    const snapshot = relative.match(/^(?:optional-)?skills\/(.+)$/);
    return { path: relative, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      source: snapshot ? '$CODEX_HOME/skills/' + snapshot[1] : relative === 'profile/AGENTS.original.md' ? '$CODEX_HOME/AGENTS.md (empty original)' : 'authored transfer artifact',
      version: snapshot ? 'not declared in source; identified by SHA-256' : '1.0.0' };
  });
fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify({ schemaVersion: 1, createdDate: '2026-10-21', kitVersion: '1.0.0', sourceOS: 'Windows', files }, null, 2) + '\n');
console.log(`Manifest: ${files.length} files`);
