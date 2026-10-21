#!/usr/bin/env node
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('codex-frontend-kit [--dry-run] [--home ABSOLUTE_PATH] [--codex-home ABSOLUTE_PATH]');
  console.log('Installs all bundled frontend skills, merges the active global AGENTS file, installs the optional frontend model profile and npm run dev rule.');
  console.log('Existing kit files are updated with backups; unrelated rules and base config.toml are preserved. --dry-run writes nothing.');
  process.exit(0);
}
for (const [script, options] of [
  ['verify.mjs', []],
  ['install.mjs', [args.includes('--dry-run') ? '--dry-run' : '--apply', '--merge-agents', '--replace-existing', '--include-optional', '--include-command-rules', ...args]],
]) {
  const result = spawnSync(process.execPath, [path.join(scripts, script), ...options], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (!args.includes('--dry-run')) console.log('Frontend setup complete. Start a new Codex chat. Connect Figma/GitHub accounts separately when needed.');
