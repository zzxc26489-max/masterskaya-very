import fs from 'node:fs';
import path from 'node:path';
const root='.'; const cssPath='assets/css/unified.css'; const css=fs.readFileSync(cssPath,'utf8');
const fail=[];
const vars=[...css.matchAll(/var\(--([\w-]+)/g)].map(m=>m[1]);
const defs=[...css.matchAll(/--([\w-]+)\s*:/g)].map(m=>m[1]);
const missing=[...new Set(vars.filter(v=>!defs.includes(v)&&!['glow-x','glow-y','dur','drift'].includes(v)))]; if(missing.length) fail.push(`undefined CSS variables: ${missing.join(', ')}`);
const pages=fs.readdirSync('.').filter(f=>f.endsWith('.html')); const required=['index.html','worlds.html','residents.html','resident-birth.html','about.html','contacts.html','resident-nutcracker.html'];
for(const p of required) if(!pages.includes(p)) fail.push(`missing mandatory page: ${p}`);
for(const p of pages){ const s=fs.readFileSync(p,'utf8'); const links=[...s.matchAll(/<link[^>]+href=["']([^"']+)/g)].map(m=>m[1].split('?')[0]); const dup=links.filter((x,i)=>links.indexOf(x)!==i && x.startsWith('assets/css/')); if(dup.length) fail.push(`${p}: duplicate CSS ${[...new Set(dup)].join(', ')}`); for(const m of s.matchAll(/(?:src|href)=["']([^"']*)["']/g)){const u=m[1]; if(!u) fail.push(`${p}: empty src/href`); const local=u.split('?')[0]; if(local && !/^(https?:|\/\/|#|mailto:|javascript:)/.test(local) && !fs.existsSync(local)) fail.push(`${p}: missing local resource ${local}`)}}
if(/(^|\})\s*\.site-header\s*\{[^}]*(?<!min-)\bheight\s*:\s*\d+(?:px|rem)/m.test(css)) fail.push('fixed height on .site-header');
if(!/\.mobile-nav[^}]*grid-template-columns:\s*repeat\(5\s*,/.test(css)) fail.push('mobile-nav must have five columns');
if(fs.readdirSync('.').some(f=>f.endsWith('.patch'))) fail.push('*.patch found in repository root');
const selectors=[...css.matchAll(/(^|})\s*([^@{}]+)\s*\{/g)].map(m=>m[2].trim()).filter(Boolean); const counts={}; for(const s of selectors) counts[s]=(counts[s]||0)+1; const repeated=Object.entries(counts).filter(([s,n])=>n>1); fs.writeFileSync('docs/css-selector-repetitions.md','# CSS selector repetition report\n\n| Selector | Definitions |\n|---|---:|\n'+repeated.map(([s,n])=>`| \`${s}\` | ${n} |`).join('\n')+'\n');
if(repeated.some(([s,n])=>n>6 && /^(\.site-header|\.mobile-nav|\.constructor-shell)$/.test(s))) fail.push('multiple ordinary blocks for protected selectors');
if(fail.length) { console.error(fail.map(x=>`ERROR: ${x}`).join('\n')); process.exit(1); }
console.log(`CSS audit passed; ${repeated.length} repeated selectors reported`);
