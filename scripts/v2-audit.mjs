import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('v2');
const requiredPages = ['index.html','worlds.html','residents.html','birth.html','constructor.html','world-dragons.html','resident-white-dragon.html','photo-preview.html'];
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return fullPath;
  });
}

const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));
for (const page of requiredPages) if (!fs.existsSync(path.join(root, page))) errors.push(`missing required page ${page}`);

for (const filePath of htmlFiles) {
  const file = path.relative(root, filePath);
  const source = fs.readFileSync(filePath, 'utf8');
  for (const [, attr, value] of source.matchAll(/\b(src|href)\s*=\s*["']([^"']*)["']/gi)) {
    if (!value || value === '#') errors.push(`${file}: empty ${attr}`);
    if (/^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(value)) continue;
    const target = value.split('#')[0].split('?')[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(filePath), target);
    if (!fs.existsSync(resolved)) errors.push(`${file}: missing ${attr} ${value}`);
  }
  if (/\b(?:home|styles|v060|unified)\.css\b/i.test(source)) errors.push(`${file}: legacy CSS connection`);
}

const cssPath = path.join(root, 'assets/css/site.css');
if (!fs.existsSync(cssPath)) errors.push('missing v2/assets/css/site.css');
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
for (const selector of ['.site-header', '.button', '.card', '.resident-card']) {
  const count = css.split('\n').filter((line) => new RegExp('^\\s*' + selector.replace('.', '\\.') + '\\s*\\{').test(line)).length;
  if (count > 1) errors.push(`duplicate base definition ${selector} (${count})`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`V2 audit passed: ${htmlFiles.length} HTML files, local resources, legacy CSS, required pages, base selectors`);
