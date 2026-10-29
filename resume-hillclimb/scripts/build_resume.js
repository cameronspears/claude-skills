#!/usr/bin/env node
// Render one resume content file (JSON) three ways from the same source.
//
//   node build_resume.js <content.json> <out-base> [--html | --measure | --text | --docx]
//
//   --docx     <out-base>.docx  (Word; for portals that demand it)
//   --html     <out-base>.html  (printed to PDF by Chrome; the submission file)
//   --measure  <out-base>.measure.html  (same layout at print width, plus a script that
//              records how many lines each bullet wraps to and how full its last line is)
//   --text     <out-base>.txt   (plain text for reviewers and judges)
//
// With no flag it writes all four. See assets/example.resume.json for the content format.
// In bullet text, **like this** renders bold. Bullets may be strings or {text, evidence}.
const fs = require('fs');
const path = require('path');

const [, , inFile, outBase, flag] = process.argv;
if (!inFile || !outBase) {
  console.error('usage: node build_resume.js <content.json> <out-base> [--html|--measure|--text|--docx]');
  process.exit(2);
}
const R = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const L = Object.assign(
  { font: 'Arial', bodyPt: 10, namePt: 18, headlinePt: 12, headingPt: 11, contactPt: 9.5, marginSideIn: 0.5, marginTbIn: 0.45 },
  R.layout || {},
);

const bulletText = (b) => (typeof b === 'string' ? b : b.text);
const segs = (s) => s.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => (p.startsWith('**') ? { text: p.slice(2, -2), bold: true } : { text: p, bold: false }));
const plain = (s) => s.replace(/\*\*/g, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SEP = '  |  ';

// ---------- text ----------
function toText() {
  const out = [R.name, R.headline, (R.contact || []).map((c) => c.label).join(' | '), '', 'SUMMARY', R.summary];
  (R.sections || []).forEach((s) => {
    out.push('', s.title.toUpperCase());
    s.entries.forEach((e) => {
      out.push([e.org, e.desc, e.link && e.link.label].filter(Boolean).join(' | '));
      e.roles.forEach((r) => {
        out.push(`${r.title}${r.note ? ' (' + r.note + ')' : ''}, ${r.dates}`);
        r.bullets.forEach((b) => out.push(`- ${plain(bulletText(b))}`));
      });
    });
  });
  if (R.skills && R.skills.length) out.push('', 'SKILLS', ...R.skills.map((s) => `${s.label}: ${s.items}`));
  if (R.education && R.education.length) out.push('', 'EDUCATION AND CERTIFICATIONS', R.education.join(' | '));
  return out.join('\n') + '\n';
}

// ---------- HTML ----------
function toHtml(measure) {
  const rich = (s) => segs(s).map((p) => (p.bold ? `<b>${esc(p.text)}</b>` : esc(p.text))).join('');
  const link = (c) => (c.url ? `<a href="${esc(c.url)}">${esc(c.label)}</a>` : esc(c.label));
  const nb = '&nbsp;&nbsp;|&nbsp;&nbsp;';
  const pageW = 8.5 - 2 * L.marginSideIn;
  let h = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(R.name)} Resume</title><style>
@page { size: Letter; margin: ${L.marginTbIn}in ${L.marginSideIn}in; }
* { box-sizing: border-box; }
body { margin: 0; font-family: ${L.font}, Helvetica, sans-serif; font-size: ${L.bodyPt}pt; line-height: 1.22; color: #000; }
${measure ? `body { width: ${pageW}in; }` : ''}
a { color: #000; text-decoration: none; }
.name { text-align: center; font-size: ${L.namePt}pt; font-weight: bold; line-height: 1.1; }
.headline { text-align: center; font-size: ${L.headlinePt}pt; margin-top: 2pt; }
.contact { text-align: center; margin-top: 4pt; font-size: ${L.contactPt}pt; white-space: nowrap; }
h2 { font-size: ${L.headingPt}pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4pt; margin: 9pt 0 3pt; padding-bottom: 1.5pt; border-bottom: 0.75pt solid #000; }
p.summary { margin: 0; }
.org { margin-top: 6pt; }
.role { display: flex; justify-content: space-between; margin-top: 1pt; }
.role.next { margin-top: 4pt; }
ul { margin: 1pt 0 0; padding-left: 13.5pt; }
li { margin: 0 0 1pt; padding-left: 1pt; }
.skills div { margin-bottom: 1pt; }
</style></head><body>`;
  h += `<div class="name">${esc(R.name)}</div><div class="headline">${esc(R.headline).replace(/\s*\|\s*/g, nb)}</div>`;
  h += `<div class="contact" data-measure="contact">${(R.contact || []).map(link).join('&nbsp;| ')}</div>`;
  h += `<h2>Summary</h2><p class="summary" data-measure="summary">${esc(R.summary)}</p>`;
  let bi = 0;
  (R.sections || []).forEach((s) => {
    h += `<h2>${esc(s.title)}</h2>`;
    s.entries.forEach((e) => {
      h += `<div class="org" data-measure="org"><b>${esc(e.org)}</b>${e.desc ? nb + esc(e.desc) : ''}${e.link ? nb + link(e.link) : ''}</div>`;
      e.roles.forEach((r, ri) => {
        h += `<div class="role${ri ? ' next' : ''}"><span><b>${esc(r.title)}</b>${r.note ? ` (${esc(r.note)})` : ''}</span><span>${esc(r.dates)}</span></div>`;
        h += `<ul>${r.bullets.map((b) => `<li data-measure="bullet" data-i="${bi++}">${rich(bulletText(b))}</li>`).join('')}</ul>`;
      });
    });
  });
  if (R.skills && R.skills.length) h += `<h2>Skills</h2><div class="skills">${R.skills.map((s) => `<div data-measure="skill"><b>${esc(s.label)}:</b> ${esc(s.items)}</div>`).join('')}</div>`;
  if (R.education && R.education.length) h += `<h2>Education and Certifications</h2><div data-measure="education">${R.education.map(esc).join(nb)}</div>`;
  if (measure) {
    // Count wrapped lines per measured element and how full the last line is, then
    // write the results into <pre id="measure"> so `chrome --dump-dom` can read them.
    h += `<pre id="measure"></pre><script>
(function () {
  var out = [];
  document.querySelectorAll('[data-measure]').forEach(function (el) {
    // Collect rects from text nodes only (nested <b>/<a> would double-count), group them by
    // line, and measure each line's extent from the element's left edge.
    var rects = [], walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      var r = document.createRange(); r.selectNodeContents(walker.currentNode);
      Array.from(r.getClientRects()).forEach(function (x) { if (x.width > 0.5) rects.push(x); });
    }
    var box = el.getBoundingClientRect();
    var lines = {};
    rects.forEach(function (x) { var t = Math.round((x.top + x.bottom) / 2 / 4); lines[t] = Math.max(lines[t] || 0, x.right); });
    var keys = Object.keys(lines).map(Number).sort(function (a, b) { return a - b; });
    var tops = keys;
    var lastW = keys.length ? lines[keys[keys.length - 1]] - box.left : 0;
    var words = el.textContent.trim().split(/\\s+/);
    out.push({ kind: el.getAttribute('data-measure'), i: el.getAttribute('data-i'), lines: tops.length,
      lastLineFill: Math.round(100 * lastW / box.width) / 100, text: el.textContent.trim().slice(0, 90),
      overflow: el.scrollWidth > el.clientWidth + 1 });
  });
  document.getElementById('measure').textContent = 'MEASURE_JSON' + JSON.stringify(out) + 'END_MEASURE';
})();
</script>`;
  }
  h += `</body></html>`;
  return h;
}

// ---------- DOCX ----------
function toDocx(file) {
  let docx;
  try { docx = require('docx'); } catch (e) {
    console.error('The "docx" npm package is missing. scripts/render.sh installs it; or run: npm install docx@9');
    process.exit(3);
  }
  const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, AlignmentType, LevelFormat, BorderStyle, TabStopType } = docx;
  const SZ = Math.round(L.bodyPt * 2);
  const TW = (inches) => Math.round(inches * 1440);
  const RIGHT = 12240 - 2 * TW(L.marginSideIn);
  const t = (text, o = {}) => new TextRun({ text, font: L.font, size: o.size || SZ, bold: o.bold, color: '000000' });
  const a = (text, url, size) => new ExternalHyperlink({ link: url, children: [new TextRun({ text, font: L.font, size: size || SZ, color: '000000' })] });
  const rich = (s) => segs(s).map((p) => t(p.text, { bold: p.bold }));
  const heading = (text) => new Paragraph({
    spacing: { before: 180, after: 60 }, keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } },
    children: [t(text.toUpperCase(), { bold: true, size: Math.round(L.headingPt * 2) })],
  });
  const body = [];
  body.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [t(R.name, { bold: true, size: Math.round(L.namePt * 2) })] }));
  body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20 }, children: [t(R.headline, { size: Math.round(L.headlinePt * 2) })] }));
  const CS = Math.round(L.contactPt * 2);
  const contact = [];
  (R.contact || []).forEach((c, i) => { if (i) contact.push(t(' | ', { size: CS })); contact.push(c.url ? a(c.label, c.url, CS) : t(c.label, { size: CS })); });
  body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 20 }, children: contact }));
  body.push(heading('Summary'));
  body.push(new Paragraph({ spacing: { after: 0, line: 240 }, children: [t(R.summary)] }));
  (R.sections || []).forEach((s) => {
    body.push(heading(s.title));
    s.entries.forEach((e, ei) => {
      const org = [t(e.org, { bold: true })];
      if (e.desc) org.push(t(SEP + e.desc));
      if (e.link) org.push(t(SEP), a(e.link.label, e.link.url));
      body.push(new Paragraph({ spacing: { before: ei ? 120 : 20 }, keepNext: true, children: org }));
      e.roles.forEach((r, ri) => {
        body.push(new Paragraph({
          spacing: { before: ri ? 80 : 20, after: 20 }, keepNext: true,
          tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }],
          children: [t(r.title, { bold: true }), ...(r.note ? [t(` (${r.note})`)] : []), t(`\t${r.dates}`)],
        }));
        r.bullets.forEach((b) => body.push(new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 20, line: 240 }, children: rich(bulletText(b)) })));
      });
    });
  });
  if (R.skills && R.skills.length) {
    body.push(heading('Skills'));
    R.skills.forEach((s) => body.push(new Paragraph({ spacing: { after: 20, line: 240 }, children: [t(`${s.label}: `, { bold: true }), t(s.items)] })));
  }
  if (R.education && R.education.length) {
    body.push(heading('Education and Certifications'));
    body.push(new Paragraph({ children: [t(R.education.join(SEP))] }));
  }
  const doc = new Document({
    creator: R.name, title: `${R.name} Resume`,
    styles: { default: { document: { run: { font: L.font, size: SZ } } } },
    numbering: { config: [{ reference: 'b', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 270, hanging: 180 } } } }] }] },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: TW(L.marginTbIn), bottom: TW(L.marginTbIn), left: TW(L.marginSideIn), right: TW(L.marginSideIn) } } }, children: body }],
  });
  return Packer.toBuffer(doc).then((buf) => fs.writeFileSync(file, buf));
}

(async () => {
  fs.mkdirSync(path.dirname(path.resolve(outBase)), { recursive: true });
  const all = !flag;
  if (all || flag === '--text') fs.writeFileSync(`${outBase}.txt`, toText());
  if (all || flag === '--html') fs.writeFileSync(`${outBase}.html`, toHtml(false));
  if (all || flag === '--measure') fs.writeFileSync(`${outBase}.measure.html`, toHtml(true));
  if (all || flag === '--docx') await toDocx(`${outBase}.docx`);
})();
