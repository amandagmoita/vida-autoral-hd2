'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = process.cwd();
const stagedOnly = process.argv.includes('--staged');
const excluded = new Set(['.git', '.vercel', 'node_modules', 'site-output']);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (excluded.has(entry.name) || entry.isSymbolicLink()) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [path.relative(root, target)];
  });
}

let files;
try {
  files = execFileSync('git', stagedOnly ? ['ls-files', '--cached', '-z'] : ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  }).split('\0').filter(Boolean);
} catch {
  if (stagedOnly) throw new Error('Não foi possível conferir o índice Git; commit bloqueado.');
  files = walk(root);
}

const uuid = /\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/i;
const resend = /\bre_[A-Za-z0-9_-]{24,}\b/;
const privateKey = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
const findings = [];
for (const file of files) {
  const target = path.join(root, file);
  const basename = path.basename(file);
  if (basename.startsWith('.env') && basename !== '.env.example') {
    findings.push(`${file}: arquivo de ambiente privado incluído no código`);
    continue;
  }
  if (file.split(path.sep).some(part => excluded.has(part))) continue;
  if (!stagedOnly && (!fs.existsSync(target) || fs.lstatSync(target).isSymbolicLink())) continue;
  const data = stagedOnly
    ? execFileSync('git', ['show', `:${file}`], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 20 * 1024 * 1024 })
    : fs.readFileSync(target);
  if (data.includes(0)) continue;
  const lines = data.toString('utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    const context = lines.slice(Math.max(0, index - 1), index + 2).join('\n');
    let rule;
    if (resend.test(line)) rule = 'possível credencial Resend';
    if (uuid.test(line) && /bodygraph/i.test(context)) rule = 'possível credencial Bodygraph';
    if (privateKey.test(line)) rule = 'chave privada';
    if (rule) findings.push(`${file}:${index + 1}: ${rule}`);
  });
}

if (findings.length) {
  console.error('Publicação bloqueada. Remova os segredos dos arquivos:');
  findings.forEach(finding => console.error(`- ${finding}`));
  // Never print matching values: build logs and Actions logs may be public.
  process.exit(1);
}
console.log('Checagem de segredos concluída, sem consultas a provedores.');
