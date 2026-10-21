import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flags = new Set();
const options = {};
const switches = new Set(['--apply', '--dry-run', '--replace-existing', '--merge-agents', '--include-optional', '--include-command-rules', '--help']);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (switches.has(arg)) flags.add(arg);
  else if (arg === '--home' || arg === '--codex-home') {
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
    options[arg] = args[++i];
  } else throw new Error(`Unknown argument: ${arg}`);
}
if (flags.has('--help')) {
  console.log('node scripts/install.mjs [--apply] [--home PATH] [--codex-home PATH] [--merge-agents] [--replace-existing] [--include-optional] [--include-command-rules]');
  console.log('Default: dry-run. Base config.toml is never modified. Conflicts are skipped unless explicitly selected.');
  process.exit(0);
}
if (flags.has('--apply') && flags.has('--dry-run')) throw new Error('Choose --apply or --dry-run, not both.');
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) throw new Error('Node.js 22.12+ required.');
for (const value of Object.values(options)) if (!path.isAbsolute(value)) throw new Error('Home overrides must be absolute paths.');
const home = path.resolve(options['--home'] || os.homedir());
// --home makes testing independent from the caller's CODEX_HOME environment.
const codexHome = path.resolve(options['--codex-home'] || (!options['--home'] && process.env.CODEX_HOME) || path.join(home, '.codex'));
const skillsHome = path.join(home, '.agents', 'skills');
if (home === path.parse(home).root || codexHome === path.parse(codexHome).root) throw new Error('A filesystem root is not a valid installation home.');
const apply = flags.has('--apply');
const replace = flags.has('--replace-existing');
const stamp = new Date().toISOString().replace(/[:.]/g, '-') + '-' + process.pid;
const backupRoot = path.join(codexHome, 'frontend-kit-backups', stamp);
const startMarker = '<!-- codex-frontend-kit:start -->';
const endMarker = '<!-- codex-frontend-kit:end -->';
const plan = [];

function walk(root, base = root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error(`Symlink in package: ${entry.name}`);
    const name = path.join(root, entry.name);
    return entry.isDirectory() ? walk(name, base) : [path.relative(base, name)];
  });
}
function same(file, bytes) {
  return fs.existsSync(file) && fs.statSync(file).isFile() && fs.readFileSync(file).equals(bytes);
}
function guard(base, target) {
  const rel = path.relative(base, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`Target leaves its installation directory: ${target}`);
  // Also inspect .agents/.codex parents inside the chosen home for redirects.
  const fromHome = path.relative(home, base);
  const boundary = !fromHome.startsWith('..') && !path.isAbsolute(fromHome) ? home : base;
  let current = boundary;
  for (const segment of ['', ...path.relative(boundary, target).split(path.sep)]) {
    if (segment) current = path.join(current, segment);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Refusing to write through symlink: ${current}`);
  }
}
function add(source, target, base, { content, force = false, skip = false } = {}) {
  guard(base, target);
  const bytes = content === undefined ? fs.readFileSync(source) : Buffer.from(content);
  const exists = fs.existsSync(target);
  if (exists && !fs.statSync(target).isFile()) throw new Error(`Expected a file: ${target}`);
  const action = same(target, bytes) ? 'unchanged' : skip ? 'skip-conflict' : exists && !replace && !force ? 'skip-conflict' : exists ? 'replace+backup' : 'create';
  plan.push({ source, target, base, bytes, action });
}
function addSkills(folder) {
  const root = path.join(kitRoot, folder);
  for (const skill of fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory())) {
    const source = path.join(root, skill.name), target = path.join(skillsHome, skill.name);
    const files = walk(source);
    // Do not mix a new skill's references with an incompatible existing SKILL.md.
    const conflict = !replace && files.some(file => {
      const dest = path.join(target, file);
      return fs.existsSync(dest) && !same(dest, fs.readFileSync(path.join(source, file)));
    });
    for (const file of files) add(path.join(source, file), path.join(target, file), skillsHome, { skip: conflict });
  }
}

addSkills('skills');
if (flags.has('--include-optional')) addSkills('optional-skills');
const agentsSource = path.join(kitRoot, 'profile', 'AGENTS.md');
const agentsTarget = path.join(codexHome, 'AGENTS.md');
if (flags.has('--merge-agents')) {
  const original = fs.existsSync(agentsTarget) ? fs.readFileSync(agentsTarget, 'utf8') : '';
  const block = `${startMarker}\n${fs.readFileSync(agentsSource, 'utf8').trim()}\n${endMarker}`;
  const start = original.indexOf(startMarker), end = original.indexOf(endMarker);
  if ((start < 0) !== (end < 0) || (start >= 0 && end < start)) throw new Error('Incomplete frontend-kit markers in existing AGENTS.md; repair manually before merging.');
  const merged = start >= 0 ? original.slice(0, start) + block + original.slice(end + endMarker.length) : original.trimEnd() + (original.trim() ? '\n\n' : '') + block + '\n';
  add(agentsSource, agentsTarget, codexHome, { content: merged, force: true });
} else add(agentsSource, agentsTarget, codexHome);
add(path.join(kitRoot, 'profile', 'config.safe.toml'), path.join(codexHome, 'frontend.config.toml'), codexHome);
if (flags.has('--include-command-rules')) add(path.join(kitRoot, 'profile', 'frontend.rules'), path.join(codexHome, 'rules', 'frontend-kit.rules'), codexHome);

console.log(`${apply ? 'APPLY' : 'DRY RUN'} — home: ${home}`);
for (const item of plan) console.log(`${item.action.padEnd(15)} ${item.target}`);
if (apply) {
  for (const item of plan.filter(p => p.action === 'create' || p.action === 'replace+backup')) {
    guard(item.base, item.target);
    if (item.action === 'replace+backup') {
      const namespace = item.base === skillsHome ? 'skills' : 'codex';
      const backup = path.join(backupRoot, namespace, path.relative(item.base, item.target));
      guard(backupRoot, backup);
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      fs.copyFileSync(item.target, backup, fs.constants.COPYFILE_EXCL);
    }
    fs.mkdirSync(path.dirname(item.target), { recursive: true });
    fs.writeFileSync(item.target, item.bytes);
  }
}
const counts = Object.fromEntries(['create', 'replace+backup', 'unchanged', 'skip-conflict'].map(key => [key, plan.filter(p => p.action === key).length]));
console.log(JSON.stringify({ applied: apply, counts, backupRoot: apply && counts['replace+backup'] ? backupRoot : null, baseConfigModified: false }));
if (fs.existsSync(path.join(codexHome, 'AGENTS.override.md'))) console.log('Note: AGENTS.override.md exists and may take precedence over AGENTS.md.');
