// Known-answer tests for the clinical calculators. Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const { CALCS, computeCalc, CALC_CATS } = require('../js/calculators.js');

const C = id => { const c = CALCS.find(x => x.id === id); assert.ok(c, 'missing calculator ' + id); return c; };
// helper: select option index whose points equal `pts`
const opt = (id, inputId, pts) => C(id).inputs.find(i => i.id === inputId).opts.findIndex(o => o[1] === pts);
const run = (id, raw) => computeCalc(C(id), raw);

test('library integrity', () => {
  const ids = new Set();
  for (const c of CALCS) {
    assert.ok(!ids.has(c.id), 'duplicate id ' + c.id); ids.add(c.id);
    assert.ok(CALC_CATS[c.cat], 'unknown category ' + c.cat);
    assert.ok(c.calc || c.bands, c.id + ' has neither calc nor bands');
    assert.ok(c.ref, c.id + ' has no reference');
    // every calculator must handle empty input without throwing
    const r = computeCalc(c, {});
    if (r) assert.ok(['ok', 'warn', 'bad', 'info'].includes(r.lvl), c.id + ' bad level ' + r.lvl);
  }
});

test('numeric calculators return null until inputs are filled', () => {
  for (const id of ['ckdepi', 'cg', 'cna', 'cca', 'ag', 'aagrad', 'meldna', 'apache2', 'fib4', 'fena', 'ldl'])
    assert.equal(run(id, {}), null, id);
});

test('CKD-EPI 2021', () => {
  assert.equal(run('ckdepi', { cr: '1.0', age: '50', sex: 0 }).v, 92);
  assert.equal(run('ckdepi', { cr: '0.7', age: '40', sex: 1 }).v, 112);
});
test('Cockcroft-Gault', () => assert.equal(run('cg', { age: '60', wt: '72', cr: '1', sex: 0 }).v, 80));
test('Corrected sodium (Katz)', () => assert.equal(run('cna', { na: '130', glu: '400' }).v, 134.8));
test('Corrected calcium', () => assert.equal(run('cca', { ca: '8', alb: '2.5' }).v, 9.2));
test('Anion gap + delta ratio', () => {
  const r = run('ag', { na: '140', cl: '100', hco3: '14', alb: '4' });
  assert.equal(r.v, 26); assert.equal(r.rows.find(x => x[0] === 'نسبة دلتا')[1], 1.4);
});
test('A-a gradient', () => assert.equal(run('aagrad', { fio2: '21', pao2: '70', paco2: '40', age: '60' }).v, 29.7));
test('MELD-Na', () => assert.equal(run('meldna', { bili: '3', inr: '1.8', cr: '1.5', na: '128' }).v, 27));
test('APACHE II', () => {
  const r = run('apache2', { temp: '39.2', map: '65', hr: '120', rr: '28', fio2: '40', pao2: '68', paco2: '32', ph: '7.30', na: '134', k: '4.2', cr: '2.1', hct: '32', wbc: '18', gcs: '13', age: '67', chr: opt('apache2', 'chr', 5) });
  assert.equal(r.v, 27);
});
test('SOFA', () => assert.equal(run('sofa', { resp: 2, coag: 1, cv: 1, renal: 1 }).v, 5));
test('QTc Bazett', () => assert.equal(run('qtc', { qt: '420', hr: '90', sex: 1 }).v, 514));
test('HbA1c conversion', () => {
  const r = run('hba1c', { a: '7' });
  assert.equal(r.v, 53); assert.match(String(r.rows[0][1]), /^154 /);
});
test('BMI', () => assert.equal(run('bmi', { wt: '80', ht: '175' }).v, 26.1));
test('Gout 2015 scoring and MSU shortcut', () => {
  assert.equal(run('gout2015', { pat: 2, ch: 3, tc: 2, ua: opt('gout2015', 'ua', 3) }).v, 10);
  assert.equal(run('gout2015', { msu: 1 }).lvl, 'bad');
});
test('RA 2010 threshold', () => {
  assert.equal(run('ra2010', { j: opt('ra2010', 'j', 3), sero: opt('ra2010', 'sero', 2), dur: 1 }).v, 6);
});
test('CHA2DS2-VASc', () => assert.equal(run('cha2ds2vasc', { htn: true, age: 2, fem: true }).v, 4));
test('NIHSS max is 42', () => {
  const raw = {}; C('nihss').inputs.forEach(i => raw[i.id] = i.opts.length - 1);
  assert.equal(run('nihss', raw).v, 42);
});
test('Rockall table lookup', () => {
  const r = run('rockall', { age: 2, shock: 2, com: 1 });
  assert.equal(r.v, 6); assert.equal(r.rows[1][1], '17.3%');
});
test('ISS staging', () => {
  assert.equal(run('iss', { b2m: '3', alb: '4' }).v, 'I');
  assert.equal(run('iss', { b2m: '4', alb: '4' }).v, 'II');
  assert.equal(run('iss', { b2m: '6', alb: '4' }).v, 'III');
});
test('D-dimer age-adjusted cutoff', () => {
  const r = run('ddimer', { age: '70', dd: '650', pre: 0 });
  assert.equal(r.v, 700); assert.equal(r.lvl, 'ok');
});
test('FIB-4', () => assert.equal(run('fib4', { age: '50', ast: '40', alt: '36', plt: '200' }).v, 1.67));
test('APRI', () => assert.equal(run('apri', { ast: '80', uln: '40', plt: '100' }).v, 2));
test('FENa', () => assert.equal(run('fena', { una: '20', pna: '140', ucr: '100', pcr: '2' }).v, 0.29));
test('Serum osmolality + gap', () => {
  const r = run('osm', { na: '140', glu: '90', bun: '14', meas: '310' });
  assert.equal(r.v, 290); assert.equal(r.lvl, 'bad');
});
test('Free water deficit', () => assert.equal(run('fwd', { na: '160', wt: '70', g: 0 }).v, 6));
test("Winter's formula", () => assert.equal(run('winters', { hco3: '12', paco2: '35' }).label, 'حماض تنفسي مصاحب'));
test('LDL Friedewald and TG >= 400 guard', () => {
  assert.equal(run('ldl', { tc: '200', hdl: '50', tg: '150' }).v, 120);
  assert.equal(run('ldl', { tc: '250', hdl: '40', tg: '450' }).lvl, 'warn');
});
test('Glasgow-Blatchford', () => {
  // urea 8–9.9 (3) + Hb 11 male (3) + SBP 95 (2) + HR (1) + melena (1) = 10
  assert.equal(run('gbs', { urea: 2, hb: '11', sex: 0, sbp: 2, hr: true, mel: true }).v, 10);
  assert.equal(run('gbs', { hb: '13.5', sex: 0 }).v, 0);
  assert.equal(run('gbs', { hb: '11', sex: 1 }).v, 1);
});
test('Maddrey DF', () => assert.equal(run('maddrey', { pt: '20', ctl: '12', bili: '8' }).v, 44.8));
test('Wells DVT can go negative', () => assert.equal(run('wellsdvt', { alt: true }).v, -2));
test('Padua', () => assert.equal(run('padua', { ca: true, mob: true }).v, 6));
test('Centor age modifier', () => assert.equal(run('centor', { ex: true, age: opt('centor', 'age', -1) }).v, 0));
test('TIMI', () => assert.equal(run('timi', { age: true, st: true, mk: true }).v, 3));
test('HEART', () => assert.equal(run('heart', { h: 2, e: 1, a: 2, r: 1, t: 0 }).v, 6));
test('Arabic-Indic digits are accepted', () => assert.equal(run('bmi', { wt: '٨٠', ht: '١٧٥' }).v, 26.1));
