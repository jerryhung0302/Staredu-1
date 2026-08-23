import fs from 'fs';
import path from 'path';
import Zip from 'adm-zip';

const rootDir = process.cwd();
const zip = new Zip();

const excludeList = [
  'node_modules',
  '.git',
  'dist',
  'bun.lock',
  'public/staredu-source.zip'
];

function addFilesRecursively(currentPath, zipPath) {
  const items = fs.readdirSync(currentPath);
  for (const item of items) {
    const fullPath = path.join(currentPath, item);
    const relPath = path.relative(rootDir, fullPath);

    if (excludeList.some(ex => relPath === ex || relPath.startsWith(ex + '/'))) {
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      addFilesRecursively(fullPath, path.join(zipPath, item));
    } else {
      const content = fs.readFileSync(fullPath);
      zip.addFile(path.join(zipPath, item).replace(/\\/g, '/'), content);
    }
  }
}

addFilesRecursively(rootDir, '');

const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'staredu-source.zip');
zip.writeZip(outputPath);
console.log(`Successfully generated zip at: ${outputPath}`);
