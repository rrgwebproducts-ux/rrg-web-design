// Writes DYNAMIC-FIELDS.md (the field list for Marc) from prototypes/_shared/dynamic-fields.js —
// the same list the Page Debugger draws. Re-run after changing that file:
//   node docs/page-debugger/build-fields-doc.js
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../../prototypes/_shared/dynamic-fields.js'), 'utf8');
const { RRG_DYN_SOURCES, RRG_DYN_FIELDS } = new Function(src + '\nreturn { RRG_DYN_SOURCES, RRG_DYN_FIELDS };')();

const AREAS = [
  { prefix: 'global.', title: 'Header, footer & global widgets', pages: 'Every page (checkout has its own header)' },
  { prefix: 'search.', title: 'Search Results', pages: 'search-results' },
  { prefix: 'pdp.', title: 'Product pages (PDP)', pages: 'vehicle-specific, config-variant, sibling-color, simple, grouped-bundle, roof-box' },
  { prefix: 'plp.', title: 'Listing pages (PLP / VPLP)', pages: 'plp, plp-camping, plp-roof-boxes, plp-awnings, plp-roof-top-tents, plp-water-carriers, plp-snow-carriers, vplp, vplp-accessories' },
  { prefix: 'vclp.', title: 'Vehicle Category Landing Page (VCLP)', pages: 'vehicle-category-landing' },
];
const cell = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const tokenCell = t => !t ? '' : typeof t === 'string' ? '`' + cell(t) + '`'
  : Object.entries(t).map(([k, v]) => `${k === '*' ? 'other' : '<sub>' + cell(k) + '</sub>'} \`${cell(v)}\``).join('<br>');
const srcLabel = k => (RRG_DYN_SOURCES[k] || { label: k }).label;

let md = `# Dynamic fields — Header, PDP, PLP

Every piece of text or media on these pages that comes from data rather than being fixed copy:
where it comes from, the field it reads, and what to show when the value is missing.

- **Generated** from \`prototypes/_shared/dynamic-fields.js\` by \`docs/page-debugger/build-fields-doc.js\`, so don't edit this file by hand.
- **See it on the page:** open any template on Vercel with \`?debug=1\` (or Site Admin → Prototype → Page debugger), tick **Dynamic fields** and hover an outlined field. Tick **Show field names** to see every value replaced by its token ("Shows as" below).
- **Status:** *Draft* means Claude's best guess from the prototype and the developer briefs, not yet checked. *Confirmed* means Brenton has checked it.

## Sources

| Source | What it covers | Fields |
|---|---|---|
${Object.entries(RRG_DYN_SOURCES).map(([k, s]) => `| **${s.label}** | ${cell(s.desc)} | ${RRG_DYN_FIELDS.filter(f => f.source === k).length} |`).join('\n')}

`;

const unknowns = RRG_DYN_FIELDS.filter(f => f.source === 'unknown' || /REVIEW/.test(f.notes || ''));
if (unknowns.length) {
  md += `## Needs an answer (${unknowns.length})

Unknown sources, plus drafts flagged REVIEW in their notes.

${unknowns.map(f => `- **${f.label}** (\`${f.id}\`, ${srcLabel(f.source)}): ${cell((f.notes || '').replace(/^.*?REVIEW:\s*/, '')) || 'source unknown'}`).join('\n')}

`;
}

AREAS.forEach(a => {
  const list = RRG_DYN_FIELDS.filter(f => f.id.startsWith(a.prefix));
  if (!list.length) return;
  md += `## ${a.title} (${list.length})

Templates: ${a.pages}

| Field | Shows as | Source | Reads | Rule (in order) | Example | Status |
|---|---|---|---|---|---|---|
${list.map(f => `| **${cell(f.label)}**<br>\`${f.id}\`${f.pages ? `<br><sub>${cell(f.pages.join(', '))}</sub>` : ''} | ${tokenCell(f.token)} | ${srcLabel(f.source)} | ${cell(f.attr)} | ${[].concat(f.rule || []).map((r, i) => `${i + 1}. ${cell(r)}`).join('<br>')} | ${cell(f.example)} | ${f.status === 'confirmed' ? 'Confirmed' : 'Draft'} |`).join('\n')}

`;
  const withNotes = list.filter(f => f.notes);
  if (withNotes.length) md += `**Notes**\n\n${withNotes.map(f => `- \`${f.id}\`: ${cell(f.notes)}`).join('\n')}\n\n`;
});

fs.writeFileSync(path.join(__dirname, 'DYNAMIC-FIELDS.md'), md);
console.log(`DYNAMIC-FIELDS.md: ${RRG_DYN_FIELDS.length} fields, ${unknowns.length} need an answer`);
