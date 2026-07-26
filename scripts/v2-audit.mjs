import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('v2');
const pages = ['index.html','worlds.html','residents.html','birth.html'];
const errors = [];
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const [, attr, value] of source.matchAll(/\b(src|href)\s*=\s*["']([^"']*)["']/gi)) {
    if (!value || value === '#') errors.push(`${file}: empty ${attr}`);
    if (/^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(value)) continue;
    const target = value.split('#')[0].split('?')[0];
    if (target && !fs.existsSync(path.resolve(path.dirname(path.join(root, file)), target))) errors.push(`${file}: missing ${attr} ${value}`);
  }
  if (/\b(?:home|styles|v060|unified)\.css\b/i.test(source)) errors.push(`${file}: legacy CSS connection`);
}
for (const page of pages) if (!fs.existsSync(path.join(root, page))) errors.push(`missing required page ${page}`);
const css = fs.readFileSync(path.join(root, 'assets/css/site.css'), 'utf8');
for (const selector of ['.site-header', '.button', '.card', '.resident-card']) {
  const count = css.split('\n').filter((line) => new RegExp('^\\s*' + selector.replace('.', '\\.') + '\\s*\\{').test(line)).length;
  if (count > 1) errors.push(`duplicate base definition ${selector} (${count})`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`V2 audit passed: ${htmlFiles.length} HTML files, local resources, legacy CSS, required pages, base selectors`);
