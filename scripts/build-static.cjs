'use strict';

const fs = require('node:fs');
const path = require('node:path');
const output = path.join(process.cwd(), 'site-output');
const assets = [
  ['mapa/index.html', 'mapa/index.html'],
  ['what-hd.jpg', 'what-hd.jpg'],
];

fs.rmSync(output, { recursive: true, force: true });
for (const [source, destination] of assets) {
  if (!fs.statSync(source).isFile() || fs.lstatSync(source).isSymbolicLink()) {
    throw new Error(`Arquivo estático inválido: ${source}`);
  }
  const target = path.join(output, destination);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}
console.log('Saída pública criada a partir da lista explícita de arquivos permitidos.');
