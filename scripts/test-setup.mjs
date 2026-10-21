import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'frontend-setup-test-'));
const home = path.join(scratch, 'test-home');
function run(source, destination, ...args) {
  return spawnSync(process.execPath, [path.join(source, 'scripts/setup.mjs'), '--home', destination, ...args], { encoding: 'utf8' });
}
let result = run(root, home, '--dry-run');
assert.equal(result.status, 0, result.stderr);
assert.ok(!fs.existsSync(home), 'One-command dry run does not write');
const codex = path.join(home, '.codex');
fs.mkdirSync(codex, { recursive: true });
const baseConfig = 'model = "personal-model"\n';
fs.writeFileSync(path.join(codex, 'config.toml'), baseConfig);
fs.writeFileSync(path.join(codex, 'AGENTS.override.md'), 'Keep my personal override.\n');
result = run(root, home);
assert.equal(result.status, 0, result.stderr);
const skills = path.join(home, '.agents/skills');
assert.equal(fs.readdirSync(skills).length, 11, 'One command installs the complete bundled skill set');
for (const name of ['frontend-react-workflow', 'gsap-react', 'gsap-scrolltrigger', 'copy-editing', 'humanizer']) {
  assert.ok(fs.existsSync(path.join(skills, name, 'SKILL.md')));
}
const effective = fs.readFileSync(path.join(codex, 'AGENTS.override.md'), 'utf8');
assert.ok(effective.startsWith('Keep my personal override.'));
assert.equal((effective.match(/codex-frontend-kit:start/g) || []).length, 1);
assert.ok(effective.includes('Lenis') && effective.includes('React'));
assert.ok(!fs.existsSync(path.join(codex, 'AGENTS.md')), 'Rules are merged into the effective override');
assert.equal(fs.readFileSync(path.join(codex, 'config.toml'), 'utf8'), baseConfig);
assert.ok(fs.existsSync(path.join(codex, 'frontend.config.toml')));
assert.ok(fs.existsSync(path.join(codex, 'rules/frontend-kit.rules')));
assert.ok(fs.existsSync(path.join(skills, 'gsap-core/LICENSE')));
assert.ok(fs.existsSync(path.join(skills, 'copy-editing/LICENSE')));
result = run(root, home);
assert.equal(result.status, 0, result.stderr);
assert.ok(result.stdout.includes('"create":0,"replace+backup":0'), 'Repeating setup is idempotent');
assert.equal(fs.readFileSync(path.join(codex, 'AGENTS.override.md'), 'utf8'), effective);
const target = path.join(skills, 'gsap-core/SKILL.md');
fs.writeFileSync(target, 'An older installed copy');
result = run(root, home);
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(target, 'utf8'), fs.readFileSync(path.join(root, 'skills/gsap-core/SKILL.md'), 'utf8'));
const backups = fs.readdirSync(path.join(codex, 'frontend-kit-backups'), { recursive: true });
assert.ok(backups.some(file => String(file).endsWith('SKILL.md')), 'Updating a kit file creates a backup');
assert.equal(fs.readFileSync(path.join(codex, 'config.toml'), 'utf8'), baseConfig);

const damaged = path.join(scratch, 'damaged-package');
fs.cpSync(root, damaged, { recursive: true, filter: source => !['.git', 'node_modules', '.test-output'].includes(path.basename(source)) });
fs.appendFileSync(path.join(damaged, 'profile/AGENTS.md'), '\nChanged after manifest generation\n');
const untouched = path.join(scratch, 'must-not-exist');
result = run(damaged, untouched);
assert.notEqual(result.status, 0, 'An integrity failure must stop installation');
assert.ok(!fs.existsSync(untouched), 'Failed verification does not partially install');
console.log('Passed: complete one-command setup, active AGENTS override, repeat/update/backups, unchanged base config, integrity before writes.');
console.log(`Test fixtures retained: ${scratch}`);
