import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (['.git', 'node_modules', '.test-output'].includes(entry.name)) return [];
    assert.ok(!entry.isSymbolicLink(), `Symlink is not portable: ${entry.name}`);
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [path.relative(root, full).split(path.sep).join('/')];
  });
}
// npm may rename the archive's root .gitignore to .npmignore during extraction.
// Neither file is executed or installed into the Codex profile.
const actualFiles = listFiles(root).filter(name => !['manifest.json', '.gitignore', '.npmignore', '.gitattributes'].includes(name) && !/\.(zip|tgz)$/.test(name)).sort();
assert.deepEqual(actualFiles, manifest.files.map(f => f.path).sort(), 'Unlisted or missing package files; regenerate and review the manifest');
let links = 0;
const issues = [];
for (const entry of manifest.files) {
  const full = path.resolve(root, entry.path);
  assert.ok(!path.relative(root, full).startsWith('..'), 'Manifest path stays in package');
  const bytes = fs.readFileSync(full);
  assert.equal(bytes.length, entry.bytes, `Size mismatch: ${entry.path}`);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), entry.sha256, `Hash mismatch: ${entry.path}`);
  assert.ok(!/(^|\/)(auth\.json|\.env(?:\..*)?|.*\.sqlite(?:-wal|-shm)?|id_rsa|id_ed25519)$/i.test(entry.path), `Forbidden file: ${entry.path}`);
  const text = bytes.toString('utf8');
  const secretPatterns = [new RegExp('sk-' + '[A-Za-z0-9_-]{32,}'), new RegExp('gh[pousr]_' + '[A-Za-z0-9]{30,}'), new RegExp('github_pat_' + '[A-Za-z0-9_]{40,}'), new RegExp('-----BEGIN ' + '(?:RSA |OPENSSH |EC )?PRIVATE KEY-----')];
  assert.ok(!secretPatterns.some(re => re.test(text)), `Possible credential signature: ${entry.path}`);
  if (/^(?:optional-)?skills\/.+\.md$/.test(entry.path)) {
    const prose = text.replace(/```[\s\S]*?```/g, '');
    for (const match of prose.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const url = match[1].replace(/^<|>$/g, '');
      if (/^(?:[a-z]+:|#|\/)/i.test(url)) continue;
      const target = decodeURIComponent(url.split('#')[0]);
      if (!target) continue;
      links++;
      if (!fs.existsSync(path.resolve(path.dirname(full), target))) issues.push(`${entry.path} -> ${target}`);
    }
  }
}
assert.deepEqual(issues, [], 'Broken relative Markdown links in skill snapshots');
const config = fs.readFileSync(path.join(root, 'profile', 'config.safe.toml'), 'utf8');
const keys = config.split(/\r?\n/).map(line => line.match(/^([a-z_]+)\s*=/)?.[1]).filter(Boolean);
assert.deepEqual(keys, ['model', 'model_reasoning_effort', 'service_tier']);
assert.ok(!/approval_policy|sandbox_mode|mcp_servers|\[plugins/.test(config.replace(/^#.*$/gm, '')));
console.log(`Verified ${manifest.files.length} hashes; ${links} relative skill links; credential signatures; portable config allowlist.`);
