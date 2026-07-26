import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), norm=(u,from='.')=>{try{u=decodeURIComponent(u.split(/[?#]/)[0]);if(!u||/^(https?:|\/\/|mailto:|tel:|data:|javascript:)/i.test(u))return null;return path.posix.normalize(path.posix.join(from.replaceAll('\\','/'),u)).replace(/^\.\//,'')}catch{return null}};
const files=[...fs.readdirSync(root).filter(x=>x.endsWith('.html')).map(x=>path.join(root,x)),...['assets/css','assets/js'].flatMap(d=>fs.existsSync(path.join(root,d))?fs.readdirSync(path.join(root,d)).map(x=>path.join(root,d,x)):[])];
const used=new Set(), pageRows=[]; const add=(u,from='.')=>{const n=norm(u,from);if(n&&fs.existsSync(path.join(root,n)))used.add(n);return n};
for(const p of files.filter(x=>x.endsWith('.html'))){const s=fs.readFileSync(p,'utf8'), css=[...s.matchAll(/<link[^>]+href=["']([^"']+)/gi)].map(m=>add(m[1])), js=[...s.matchAll(/<script[^>]+src=["']([^"']+)/gi)].map(m=>add(m[1])), refs=[...s.matchAll(/(?:src|href|poster|srcset)=["']([^"']+)/gi)].flatMap(m=>m[1].split(',').map(x=>x.trim().split(/\s+/)[0])).map(x=>add(x)); pageRows.push({page:path.basename(p),css:css.filter(Boolean),js:js.filter(Boolean),broken:[...new Set(refs.filter(x=>x&&!fs.existsSync(path.join(root,x))))]})}
for(const p of files.filter(x=>x.endsWith('.css')||x.endsWith('.js'))){const s=fs.readFileSync(p,'utf8');for(const m of s.matchAll(/(?:url\(|["'`])(assets\/[^\s"'`)]+)/g))add(m[1]);}
const all=[...fs.readdirSync(root,{recursive:true})].filter(x=>fs.statSync(path.join(root,x)).isFile()); const safe=all.filter(x=>/^(assets\/images\/(?:Test\.Txt|constructor\/Test\.txt))$/.test(x)&&!used.has(x));
const cssDeps=[...new Set(pageRows.flatMap(r=>r.css))], jsDeps=[...new Set(pageRows.flatMap(r=>r.js))];
fs.writeFileSync('docs/site-file-audit.md','# Site file audit\n\n## Page inventory\n\n| HTML page | CSS files | JS files | Broken resources | Migration status |\n|---|---|---|---|---|\n'+pageRows.map(r=>`| \`${r.page}\` | ${r.css.map(x=>'`'+x+'`').join(', ')||'—'} | ${r.js.map(x=>'`'+x+'`').join(', ')||'—'} | ${r.broken.join(', ')||'—'} | ${r.css.some(x=>x.endsWith('home.css'))?'home.css':r.css.some(x=>x.endsWith('unified.css'))?'unified.css':r.css.some(x=>x.endsWith('styles.css'))?'styles.css + v060.css':'—'} |`).join('\n')+'\n\n## Legacy dependencies\n'+cssDeps.map(x=>'- `'+x+'`').join('\n')+'\n');
fs.writeFileSync('docs/unused-files-audit.md','# Unused files audit\n\n## 1. Safe to delete\n'+(safe.map(x=>'- `'+x+'`').join('\n')||'- None')+'\n\n## 2. Probably unused — requires manual confirmation\n- None classified automatically; unreferenced assets require manual review.\n\n## 3. Must keep\n'+[...used].sort().map(x=>'- `'+x+'`').join('\n')+'\n\n## 4. Generated or temporary files\n- Generated image directories and `.gitkeep` placeholders are retained.\n');
const css=fs.readFileSync('assets/css/unified.css','utf8'), vars=[...css.matchAll(/var\(--([\w-]+)/g)].map(m=>m[1]),defs=[...css.matchAll(/--([\w-]+)\s*:/g)].map(m=>m[1]); const errors=[]; const missing=[...new Set(vars.filter(v=>!defs.includes(v)&&!['glow-x','glow-y','dur','drift'].includes(v)))];if(missing.length)errors.push('undefined CSS variables: '+missing.join(','));
if(!/\.mobile-nav[^}]*grid-template-columns:\s*repeat\(5\s*,/.test(css))errors.push('mobile-nav must have five columns'); if(all.some(x=>x.endsWith('.patch')))errors.push('patch artifact found');
const protectedSel=['.site-header','.main-nav','.site-search','.mobile-nav','.birth-page .constructor-shell','.preview-stage','.birth-page .variant-grid'];
const baseCounts={}, mediaCounts={};
function parseSelectors(source){
  const clean=source.replace(/\/\*[\s\S]*?\*\//g,''); let depth=0, mediaDepth=0, keyDepth=0, token='', quote='';
  for(let i=0;i<clean.length;i++){const c=clean[i]; if(quote){if(c===quote&&clean[i-1]!=='\\')quote=''; continue} if(c==='"'||c==="'"){quote=c;continue}
    if(c==='{'){const head=token.trim(); token=''; const isMedia=/^@media\b/i.test(head), isKey=/^@(?:-\w+-)?keyframes\b/i.test(head); depth++; if(isMedia)mediaDepth=depth; if(isKey)keyDepth=depth; if(!head.startsWith('@')&&!keyDepth){const target=mediaDepth&&depth>mediaDepth?mediaCounts:baseCounts; for(const sel of head.split(',')){const x=sel.trim();if(x)target[x]=(target[x]||0)+1}} continue}
    if(c==='}'){if(depth===keyDepth)keyDepth=0;if(depth===mediaDepth)mediaDepth=0;depth--;token='';continue} token+=c;
  }
}
parseSelectors(css);
const critical=protectedSel.filter(s=>(baseCounts[s]||0)>1);if(critical.length)errors.push('duplicate base selectors: '+critical.join(','));
const selectors=[...new Set([...Object.keys(baseCounts),...Object.keys(mediaCounts)])]; const repeated=selectors.filter(s=>(baseCounts[s]||0)+(mediaCounts[s]||0)>1);
fs.writeFileSync('docs/css-selector-repetitions.md','# CSS selector repetition report\n\n| Selector | Base definitions | Media overrides | Total |\n|---|---:|---:|---:|\n'+repeated.map(s=>`| \`${s}\` | ${baseCounts[s]||0} | ${mediaCounts[s]||0} | ${(baseCounts[s]||0)+(mediaCounts[s]||0)} |`).join('\n')+'\n\n## Critical duplicate base selectors\n'+(critical.map(x=>`- \`${x}\` — ${baseCounts[x]} base definitions`).join('\n')||'- None')+'\n');
if(errors.length){console.error(errors.join('\n'));process.exit(1)} console.log('CSS audit passed');
