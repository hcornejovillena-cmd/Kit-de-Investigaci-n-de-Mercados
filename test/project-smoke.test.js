import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scriptNames = [
  'i18n.js',
  'state-cases.js',
  'education.js',
  'app-shell.js',
  'ai-service.js',
  'engines/conjoint-engine.js',
  'conjoint.js',
  'engines/maxdiff-engine.js',
  'maxdiff.js',
  'engines/van-westendorp-engine.js',
  'van-westendorp.js',
  'engines/nms-engine.js',
  'nms.js',
  'engines/turf-engine.js',
  'turf.js',
  'init.js'
];
const scripts = scriptNames.map(name => fs.readFileSync(new URL(`../public/js/${name}`, import.meta.url), 'utf8'));
const javascript = scripts.join('\n');
const css = fs.readFileSync(new URL('../src/styles/app.css', import.meta.url), 'utf8');

test('the split project references its extracted assets', () => {
  assert.match(html, /src\/styles\/app\.css/);
  for (const name of scriptNames) assert.match(html, new RegExp(name.replace('.', '\\.')));
  assert.doesNotMatch(html, /<style>/i);
});

test('direct file previews load scripts from public without changing hosted paths', () => {
  assert.match(html, /location\.protocol === 'file:' \? '\.\/public\/js\/' : '\.\/js\/'/);
});

test('language switching refreshes the dynamic education report', () => {
  const i18n = fs.readFileSync(new URL('../public/js/i18n.js', import.meta.url), 'utf8');
  assert.match(i18n, /classList\.contains\('act'\).*renderReportSummary\(\)/s);
});

test('the extracted JavaScript is syntactically valid', () => {
  for (const script of scripts) assert.doesNotThrow(() => new vm.Script(script));
});

test('the extracted assets are not empty', () => {
  assert.ok(javascript.length > 400_000);
  assert.ok(css.length > 30_000);
});

test('the BYOK credential remains memory-only and uses OpenAI naming', () => {
  assert.doesNotMatch(javascript, /localStorage|sessionStorage/);
  assert.doesNotMatch(`${html}\n${javascript}`, /gemini-key|_geminiKey/);
  assert.match(html, /id="openai-key"/);
});

test('Van Westendorp engine is DOM-independent and rejects inconsistent rows', () => {
  const engine = fs.readFileSync(new URL('../public/js/engines/van-westendorp-engine.js', import.meta.url), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(engine, context);
  const records = [
    { muy_barato: 1, barato: 2, caro: 4, muy_caro: 5 },
    { muy_barato: 2, barato: 3, caro: 5, muy_caro: 6 },
    { muy_barato: 3, barato: 4, caro: 6, muy_caro: 7 },
    { muy_barato: 4, barato: 5, caro: 7, muy_caro: 8 },
    { muy_barato: 9, barato: 2, caro: 3, muy_caro: 4 }
  ];
  const result = context.computeVanWestendorp(records, { minRows: 4 });
  assert.equal(result.valid.length, 4);
  assert.equal(result.excluded, 1);
  assert.ok(Number.isFinite(result.OPP.price));
  assert.ok(result.PMC.price <= result.PME.price);
});

test('MaxDiff engine is DOM-independent and returns known aggregate scores', () => {
  const engine = fs.readFileSync(new URL('../public/js/engines/maxdiff-engine.js', import.meta.url), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(engine, context);
  const items = ['A', 'B', 'C'];
  const designs = [[[0, 1, 2], [0, 1, 2]]];
  const responses = [
    { id_encuestado: 1, version: 1, t1_mejor: 1, t1_peor: 3, t2_mejor: 1, t2_peor: 2 },
    { id_encuestado: 2, version: 1, t1_mejor: 2, t1_peor: 3, t2_mejor: 1, t2_peor: 3 }
  ];
  const result = context.computeMaxDiff(items, designs, responses);
  assert.deepEqual(
    result.ranked.map(row => ({ item: row.it, net: row.net, score: row.score })),
    [
      { item: 'A', net: 3, score: 66.7 },
      { item: 'B', net: 0, score: 33.3 },
      { item: 'C', net: -3, score: 0 }
    ]
  );
  assert.deepEqual([...result.indivScores[0].net], [2, -1, -1]);
  assert.equal(result.ranked.reduce((sum, row) => sum + row.score, 0), 100);
});

test('MaxDiff engine creates deterministic balanced designs and validates choices', () => {
  const engine = fs.readFileSync(new URL('../public/js/engines/maxdiff-engine.js', import.meta.url), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(engine, context);
  const items = ['A', 'B', 'C', 'D', 'E', 'F'];
  const first = context.createMaxDiffDesign(items, { itemsPerSet: 3, versions: 2, seed: 111 });
  const second = context.createMaxDiffDesign(items, { itemsPerSet: 3, versions: 2, seed: 111 });
  assert.deepEqual(JSON.parse(JSON.stringify(first.designs)), JSON.parse(JSON.stringify(second.designs)));
  for (const design of first.designs) {
    const appearances = new Array(items.length).fill(0);
    design.forEach(set => set.forEach(index => { appearances[index] += 1; }));
    assert.ok(Math.max(...appearances) - Math.min(...appearances) <= 2);
  }
  const set = first.designs[0][0];
  const validChoice = set[0] + 1;
  const invalidChoice = [...Array(items.length).keys()].find(index => !set.includes(index)) + 1;
  const result = context.computeMaxDiff(items, first.designs, [{ version: 1, t1_mejor: validChoice, t1_peor: invalidChoice }]);
  assert.equal(result.validation.invalidChoices, 1);
  assert.equal(result.ranked.reduce((sum, row) => sum + row.w, 0), 0);
});

test('NMS engine composes Van Westendorp and returns known demand optima', () => {
  const vwEngine = fs.readFileSync(new URL('../public/js/engines/van-westendorp-engine.js', import.meta.url), 'utf8');
  const nmsEngine = fs.readFileSync(new URL('../public/js/engines/nms-engine.js', import.meta.url), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(`${vwEngine}\n${nmsEngine}`, context);
  const records = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    muy_barato: 10,
    barato: 20,
    caro: 30,
    muy_caro: 40,
    intent_barato: 5,
    intent_caro: 3
  }));
  records.push({ muy_barato: 30, barato: 20, caro: 25, muy_caro: 40, intent_barato: 5, intent_caro: 3 });
  const result = context.computeNMS(records, { minRows: 10 });
  assert.equal(result.valid.length, 10);
  assert.equal(result.excluded, 1);
  assert.equal(result.maxDemand.price, 20);
  assert.equal(result.maxDemand.demand_pct, 70);
  assert.equal(result.maxRev.price, 20);
  assert.equal(result.maxRev.rev, 1400);
  assert.ok(Number.isFinite(result.OPP.price));
});

test('TURF engine finds a known optimal binary portfolio', () => {
  const engine = fs.readFileSync(new URL('../public/js/engines/turf-engine.js', import.meta.url), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(engine, context);
  const items = ['A', 'B', 'C'];
  const matrix = [
    { id: 1, values: [1, 0, 0] },
    { id: 2, values: [1, 0, 0] },
    { id: 3, values: [0, 1, 0] },
    { id: 4, values: [0, 1, 1] }
  ];
  const result = context.computeTURF(matrix, items, { type: 'binary', kmax: 2, topN: 5 });
  assert.deepEqual([...result.bestByK[0].best.combo], [0]);
  assert.equal(result.bestByK[0].best.reachPct, 50);
  assert.deepEqual([...result.bestByK[1].best.combo], [0, 1]);
  assert.equal(result.bestByK[1].best.reachPct, 100);
  assert.equal(result.overlap[1][2], 50);
});

test('TURF exact Shapley values are symmetric and efficient', () => {
  const engine = fs.readFileSync(new URL('../public/js/engines/turf-engine.js', import.meta.url), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(engine, context);
  const matrix = [
    { values: [1, 0] },
    { values: [0, 1] }
  ];
  const getReach = portfolio => context.calcReachBinary(matrix, portfolio) / matrix.length * 100;
  const result = context.calcShapleyPortfolio(matrix, [0, 1], getReach);
  assert.equal(result.exact, true);
  assert.equal(result.permCount, 2);
  assert.deepEqual([...result.shapley], [50, 50]);
  assert.equal(result.shapley.reduce((sum, value) => sum + value, 0), getReach([0, 1]));
});

test('CBC engine estimates preference direction and true arc price elasticity', () => {
  const engine = fs.readFileSync(new URL('../public/js/engines/conjoint-engine.js', import.meta.url), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(engine, context);
  const attributes = [
    { name: 'Precio', levels: ['S/ 10', 'S/ 20', 'S/ 30'] },
    { name: 'Calidad', levels: ['Básica', 'Premium'] }
  ];
  const design = [[
    [{ Precio: 'S/ 10', Calidad: 'Básica' }, { Precio: 'S/ 30', Calidad: 'Básica' }],
    [{ Precio: 'S/ 20', Calidad: 'Premium' }, { Precio: 'S/ 20', Calidad: 'Básica' }],
    [{ Precio: 'S/ 10', Calidad: 'Premium' }, { Precio: 'S/ 30', Calidad: 'Básica' }],
    [{ Precio: 'S/ 30', Calidad: 'Premium' }, { Precio: 'S/ 30', Calidad: 'Básica' }]
  ]];
  const responses = Array.from({ length: 40 }, (_, index) => ({
    id_encuestado: index + 1,
    version: 1,
    tarea_1: 1,
    tarea_2: 1,
    tarea_3: 1,
    tarea_4: 1
  }));
  const result = context.estimateCBC(attributes, design, responses, { iterations: 800 });
  assert.ok(result.utils.Precio['S/ 10'] > result.utils.Precio['S/ 30']);
  assert.ok(result.utils.Calidad.Premium > result.utils.Calidad['Básica']);
  assert.equal(Math.round(Object.values(result.imp).reduce((sum, value) => sum + value, 0)), 100);
  assert.equal(context.detectCBCPriceAttribute(attributes), 'Precio');
  const elasticity = context.computeCBCPriceElasticity(attributes, result.utils, 'Precio', { Calidad: 'Premium' });
  assert.equal(elasticity.applicable, true);
  assert.deepEqual(elasticity.points.map(point => point.price), [10, 20, 30]);
  assert.ok(elasticity.points.slice(1).every(point => Number.isFinite(point.elasticity) && point.elasticity < 0));
});

test('CBC design generator is deterministic, unique within tasks and level-balanced', () => {
  const engine = fs.readFileSync(new URL('../public/js/engines/conjoint-engine.js', import.meta.url), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(engine, context);
  const attributes = [
    { name: 'Precio', levels: ['10', '20', '30'] },
    { name: 'Plan', levels: ['Básico', 'Premium'] }
  ];
  const first = context.createCBCDesign(attributes, { tasks: 12, alternatives: 3, versions: 2, seed: 42 });
  const second = context.createCBCDesign(attributes, { tasks: 12, alternatives: 3, versions: 2, seed: 42 });
  assert.deepEqual(JSON.parse(JSON.stringify(first.designs)), JSON.parse(JSON.stringify(second.designs)));
  first.designs.forEach(design => {
    design.forEach(task => {
      const signatures = task.map(profile => attributes.map(attribute => profile[attribute.name]).join('|'));
      assert.equal(new Set(signatures).size, task.length);
    });
    attributes.forEach(attribute => {
      const counts = attribute.levels.map(level => design.flat().filter(profile => profile[attribute.name] === level).length);
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 2);
    });
  });
});
