// Pure MaxDiff design, validation and statistical engine shared by both workflows.
function createMaxDiffRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  };
}

function validateMaxDiffItems(items, options = {}) {
  const minimum = options.minimum ?? 5;
  const maximum = options.maximum ?? 30;
  if (!Array.isArray(items) || items.length < minimum || items.length > maximum) {
    const error = new RangeError(`MaxDiff requires between ${minimum} and ${maximum} items.`);
    error.code = 'MAXDIFF_ITEM_COUNT';
    throw error;
  }
  const normalized = items.map(item => String(item ?? '').trim());
  if (normalized.some(item => item.length === 0)) {
    const error = new TypeError('MaxDiff item labels cannot be empty.');
    error.code = 'MAXDIFF_EMPTY_ITEM';
    throw error;
  }
  if (new Set(normalized).size !== normalized.length) {
    const error = new TypeError('MaxDiff item labels must be unique.');
    error.code = 'MAXDIFF_DUPLICATE_ITEM';
    throw error;
  }
  return normalized;
}

function buildMaxDiffDesign(itemCount, itemsPerSet, taskCount, random) {
  const sets = [];
  const appearances = new Array(itemCount).fill(0);
  for (let task = 0; task < taskCount; task += 1) {
    const weighted = Array.from({ length: itemCount }, (_, index) => ({
      index,
      priority: appearances[index] + random()
    }));
    weighted.sort((first, second) => first.priority - second.priority);
    const selected = weighted.slice(0, itemsPerSet).map(entry => entry.index).sort(() => random() - 0.5);
    selected.forEach(index => { appearances[index] += 1; });
    sets.push(selected);
  }
  return sets;
}

function createMaxDiffDesign(items, options = {}) {
  const normalizedItems = validateMaxDiffItems(items, options);
  const itemsPerSet = Number(options.itemsPerSet ?? 4);
  const versions = Number(options.versions ?? 1);
  if (!Number.isInteger(itemsPerSet) || itemsPerSet < 2 || itemsPerSet > normalizedItems.length) {
    throw new RangeError('MaxDiff itemsPerSet must be an integer within the item count.');
  }
  if (!Number.isInteger(versions) || versions < 1) throw new RangeError('MaxDiff requires at least one version.');
  const taskCount = Number(options.taskCount ?? Math.max(8, Math.ceil(normalizedItems.length * 4 / itemsPerSet)));
  const baseSeed = Number(options.seed ?? 111);
  const designs = Array.from({ length: versions }, (_, version) =>
    buildMaxDiffDesign(normalizedItems.length, itemsPerSet, taskCount, createMaxDiffRandom(baseSeed + version * 77)));
  return { items: normalizedItems, designs, taskCount, itemsPerSet, versions };
}

function normalizeMaxDiffResponses(rawData, designs, itemCount) {
  const issues = { invalidVersions: 0, invalidChoices: 0 };
  const rows = (Array.isArray(rawData) ? rawData : []).map(source => {
    const row = { ...source };
    const numericVersion = Number(source.version);
    const requestedVersion = Number.isInteger(numericVersion) ? numericVersion : 1;
    const versionIndex = Math.max(0, Math.min(requestedVersion - 1, designs.length - 1));
    if (!Number.isInteger(numericVersion) || numericVersion < 1 || numericVersion > designs.length) issues.invalidVersions += 1;
    row.version = versionIndex + 1;
    designs[versionIndex].forEach((set, taskIndex) => {
      ['mejor', 'peor'].forEach(kind => {
        const field = `t${taskIndex + 1}_${kind}`;
        const choice = Number(source[field]);
        if (Number.isInteger(choice) && choice >= 1 && choice <= itemCount && set.includes(choice - 1)) row[field] = choice;
        else {
          if (source[field] !== undefined && source[field] !== '') issues.invalidChoices += 1;
          row[field] = undefined;
        }
      });
    });
    return row;
  });
  return { rows, issues };
}

function computeMaxDiff(items, designs, rawData) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError('MaxDiff requires a non-empty items array.');
  }
  if (!Array.isArray(designs) || designs.length === 0) {
    throw new TypeError('MaxDiff requires at least one design version.');
  }
  if (!Array.isArray(rawData)) {
    throw new TypeError('MaxDiff responses must be an array.');
  }

  const itemCount = items.length;
  const normalized = normalizeMaxDiffResponses(rawData, designs, itemCount);
  const bestCounts = new Array(itemCount).fill(0);
  const worstCounts = new Array(itemCount).fill(0);

  const individualScores = normalized.rows.map(row => {
    const requestedVersion = Number(row.version) || 1;
    const versionIndex = Math.max(0, Math.min(requestedVersion - 1, designs.length - 1));
    const best = new Array(itemCount).fill(0);
    const worst = new Array(itemCount).fill(0);

    designs[versionIndex].forEach((set, taskIndex) => {
      const bestChoice = Number(row[`t${taskIndex + 1}_mejor`]);
      const worstChoice = Number(row[`t${taskIndex + 1}_peor`]);
      if (bestChoice >= 1 && bestChoice <= itemCount) {
        bestCounts[bestChoice - 1] += 1;
        best[bestChoice - 1] += 1;
      }
      if (worstChoice >= 1 && worstChoice <= itemCount) {
        worstCounts[worstChoice - 1] += 1;
        worst[worstChoice - 1] += 1;
      }
    });

    const net = items.map((_, index) => best[index] - worst[index]);
    const minimum = Math.min(...net);
    const maximum = Math.max(...net);
    const range = maximum - minimum || 1;
    return {
      id: row.id_encuestado,
      version: requestedVersion,
      net,
      norm: net.map(score => Math.round((score - minimum) / range * 1000) / 10)
    };
  });

  const net = items.map((_, index) => bestCounts[index] - worstCounts[index]);
  const minimumNet = Math.min(...net);
  const shifted = net.map(score => score - minimumNet);
  const shiftedTotal = shifted.reduce((sum, score) => sum + score, 0) || 1;
  let runningSum = 0;
  const scores = shifted.map((score, index) => {
    if (index === itemCount - 1) return Math.round((100 - runningSum) * 10) / 10;
    const percentage = Math.round(score / shiftedTotal * 1000) / 10;
    runningSum += percentage;
    return percentage;
  });

  const ranked = items
    .map((item, index) => ({
      it: item,
      rank: 0,
      b: bestCounts[index],
      w: worstCounts[index],
      net: net[index],
      score: scores[index]
    }))
    .sort((first, second) => second.net - first.net);
  ranked.forEach((result, index) => { result.rank = index + 1; });

  return { ranked, indivScores: individualScores, validation: normalized.issues };
}
