// Pure CBC Conjoint engine: multinomial-logit estimation, simulation and price elasticity.
function validateCBCAttributes(attributes) {
  if (!Array.isArray(attributes) || attributes.length < 2) throw new RangeError('CBC requires at least two attributes.');
  const names = new Set();
  return attributes.map(attribute => {
    const name = String(attribute.name ?? '').trim();
    const levels = Array.isArray(attribute.levels) ? attribute.levels.map(level => String(level ?? '').trim()) : [];
    if (!name || levels.length < 2 || levels.some(level => !level)) throw new TypeError('CBC attributes require a name and at least two non-empty levels.');
    if (names.has(name) || new Set(levels).size !== levels.length) throw new TypeError('CBC attribute and level labels must be unique.');
    names.add(name);
    return { name, levels };
  });
}

function createCBCRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  };
}

function createCBCDesign(attributes, options = {}) {
  const attrs = validateCBCAttributes(attributes);
  const tasks = Number(options.tasks ?? 15);
  const alternatives = Number(options.alternatives ?? 4);
  const versions = Number(options.versions ?? 1);
  const seed = Number(options.seed ?? 42);
  const possibleProfiles = attrs.reduce((product, attribute) => product * attribute.levels.length, 1);
  if (![tasks, alternatives, versions].every(value => Number.isInteger(value) && value > 0)) {
    throw new RangeError('CBC tasks, alternatives and versions must be positive integers.');
  }
  if (alternatives > possibleProfiles) throw new RangeError('CBC alternatives exceed the number of unique possible profiles.');

  const designs = Array.from({ length: versions }, (_, versionIndex) => {
    const random = createCBCRandom(seed + versionIndex * 137);
    const counts = attrs.map(attribute => new Array(attribute.levels.length).fill(0));
    return Array.from({ length: tasks }, () => {
      const task = [];
      const signatures = new Set();
      while (task.length < alternatives) {
        let bestCandidate = null;
        let bestScore = Infinity;
        for (let attempt = 0; attempt < 200; attempt += 1) {
          const profile = {};
          const levelIndexes = [];
          attrs.forEach((attribute, attributeIndex) => {
            const minimum = Math.min(...counts[attributeIndex]);
            const eligible = counts[attributeIndex]
              .map((count, index) => ({ count, index }))
              .filter(entry => entry.count <= minimum + 1);
            const selected = eligible[Math.floor(random() * eligible.length)].index;
            levelIndexes.push(selected);
            profile[attribute.name] = attribute.levels[selected];
          });
          const signature = levelIndexes.join('|');
          if (signatures.has(signature)) continue;
          const score = levelIndexes.reduce((sum, levelIndex, attributeIndex) => sum + counts[attributeIndex][levelIndex], 0) + random() * 0.01;
          if (score < bestScore) bestCandidate = { profile, levelIndexes, signature }, bestScore = score;
        }
        if (!bestCandidate) throw new Error('Unable to generate unique CBC profiles for a task.');
        task.push(bestCandidate.profile);
        signatures.add(bestCandidate.signature);
        bestCandidate.levelIndexes.forEach((levelIndex, attributeIndex) => { counts[attributeIndex][levelIndex] += 1; });
      }
      return task;
    });
  });
  return { attributes: attrs, designs, tasks, alternatives, versions };
}

function createCBCEncoder(attributes) {
  const offsets = [];
  let parameterCount = 0;
  attributes.forEach(attribute => {
    offsets.push(parameterCount);
    parameterCount += attribute.levels.length - 1;
  });
  function encode(profile) {
    const vector = new Array(parameterCount).fill(0);
    if (!profile) return vector;
    attributes.forEach((attribute, attributeIndex) => {
      const levelIndex = attribute.levels.indexOf(profile[attribute.name]);
      const offset = offsets[attributeIndex];
      if (levelIndex < 0) return;
      if (levelIndex === attribute.levels.length - 1) {
        for (let index = 0; index < attribute.levels.length - 1; index += 1) vector[offset + index] = -1;
      } else vector[offset + levelIndex] = 1;
    });
    return vector;
  }
  return { offsets, parameterCount, encode };
}

function normalizeCBCResponses(rawData, designs) {
  const issues = { invalidVersions: 0, invalidChoices: 0, skippedTasks: 0 };
  const rows = Array.isArray(rawData) ? rawData : [];
  const normalized = rows.map(source => {
    const numericVersion = Number(source.version);
    const requestedVersion = Number.isInteger(numericVersion) ? numericVersion : 1;
    const versionIndex = Math.max(0, Math.min(requestedVersion - 1, designs.length - 1));
    if (!Number.isInteger(numericVersion) || numericVersion < 1 || numericVersion > designs.length) issues.invalidVersions += 1;
    const row = { ...source, version: versionIndex + 1 };
    designs[versionIndex].forEach((task, taskIndex) => {
      const field = `tarea_${taskIndex + 1}`;
      const choice = Number(source[field]);
      if (Number.isInteger(choice) && choice >= 0 && choice <= task.length) row[field] = choice;
      else {
        if (source[field] !== undefined && source[field] !== '') issues.invalidChoices += 1;
        row[field] = undefined;
      }
    });
    return row;
  });
  return { rows: normalized, issues };
}

function estimateCBC(attributes, designs, rawData, options = {}) {
  const attrs = validateCBCAttributes(attributes);
  if (!Array.isArray(designs) || designs.length === 0) throw new TypeError('CBC requires at least one design version.');
  const normalized = normalizeCBCResponses(rawData, designs);
  const encoder = createCBCEncoder(attrs);
  const observations = [];
  const levelCounts = {};
  attrs.forEach(attribute => {
    levelCounts[attribute.name] = {};
    attribute.levels.forEach(level => { levelCounts[attribute.name][level] = { ch: 0, tot: 0 }; });
  });

  normalized.rows.forEach(row => {
    const design = designs[row.version - 1];
    design.forEach((task, taskIndex) => {
      const choice = row[`tarea_${taskIndex + 1}`];
      if (choice === undefined) { normalized.issues.skippedTasks += 1; return; }
      const alternatives = [...task, null];
      const chosenIndex = choice === 0 ? task.length : choice - 1;
      alternatives.forEach((profile, alternativeIndex) => {
        if (!profile) return;
        attrs.forEach(attribute => {
          const level = profile[attribute.name];
          const count = levelCounts[attribute.name][level];
          if (count) {
            count.tot += 1;
            if (alternativeIndex === chosenIndex) count.ch += 1;
          }
        });
      });
      observations.push({ vectors: alternatives.map(encoder.encode), chosenIndex });
    });
  });
  if (observations.length === 0) throw new RangeError('CBC requires at least one valid choice task.');

  const beta = new Array(encoder.parameterCount).fill(0);
  const firstMoment = new Array(beta.length).fill(0);
  const secondMoment = new Array(beta.length).fill(0);
  const iterations = options.iterations ?? 1800;
  const learningRate = options.learningRate ?? 0.05;
  const ridge = options.ridge ?? 0.001;
  let logLikelihood = -Infinity;
  let completedIterations = 0;

  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    const gradient = new Array(beta.length).fill(0);
    logLikelihood = 0;
    observations.forEach(observation => {
      const utilities = observation.vectors.map(vector => vector.reduce((sum, value, index) => sum + value * beta[index], 0));
      const maximum = Math.max(...utilities);
      const exponentials = utilities.map(utility => Math.exp(utility - maximum));
      const total = exponentials.reduce((sum, value) => sum + value, 0);
      const probabilities = exponentials.map(value => value / total);
      logLikelihood += Math.log(Math.max(probabilities[observation.chosenIndex], 1e-15));
      observation.vectors.forEach((vector, alternativeIndex) => {
        const weight = (alternativeIndex === observation.chosenIndex ? 1 : 0) - probabilities[alternativeIndex];
        vector.forEach((value, index) => { gradient[index] += weight * value; });
      });
    });
    let maximumGradient = 0;
    beta.forEach((value, index) => {
      gradient[index] = gradient[index] / observations.length - ridge * value;
      maximumGradient = Math.max(maximumGradient, Math.abs(gradient[index]));
      firstMoment[index] = 0.9 * firstMoment[index] + 0.1 * gradient[index];
      secondMoment[index] = 0.999 * secondMoment[index] + 0.001 * gradient[index] ** 2;
      const correctedFirst = firstMoment[index] / (1 - 0.9 ** iteration);
      const correctedSecond = secondMoment[index] / (1 - 0.999 ** iteration);
      beta[index] += learningRate * correctedFirst / (Math.sqrt(correctedSecond) + 1e-8);
    });
    completedIterations = iteration;
    if (maximumGradient < 1e-7) break;
  }

  const utils = {};
  const ranges = {};
  attrs.forEach((attribute, attributeIndex) => {
    const offset = encoder.offsets[attributeIndex];
    const values = attribute.levels.slice(0, -1).map((_, index) => beta[offset + index]);
    values.push(-values.reduce((sum, value) => sum + value, 0));
    utils[attribute.name] = {};
    attribute.levels.forEach((level, index) => { utils[attribute.name][level] = values[index]; });
    ranges[attribute.name] = Math.max(...values) - Math.min(...values);
  });
  const totalRange = Object.values(ranges).reduce((sum, value) => sum + value, 0) || 1;
  let runningImportance = 0;
  const imp = {};
  attrs.forEach((attribute, index) => {
    if (index === attrs.length - 1) imp[attribute.name] = Math.round((100 - runningImportance) * 10) / 10;
    else {
      imp[attribute.name] = Math.round(ranges[attribute.name] / totalRange * 1000) / 10;
      runningImportance += imp[attribute.name];
    }
  });
  return { utils, imp, lc: levelCounts, data: normalized.rows, validation: normalized.issues, diagnostics: { observations: observations.length, logLikelihood, iterations: completedIterations } };
}

function simulateCBCShare(attributes, utilities, profiles) {
  const deterministic = profiles.map(profile => profile ? attributes.reduce((sum, attribute) => {
    const utility = utilities[attribute.name]?.[profile[attribute.name]];
    return sum + (Number.isFinite(utility) ? utility : 0);
  }, 0) : 0);
  const maximum = Math.max(...deterministic);
  const exponentials = deterministic.map(utility => Math.exp(utility - maximum));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map(value => total > 0 ? value / total * 100 : 0);
}

function parseCBCPriceLevel(label) {
  const match = String(label).replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : NaN;
}

function detectCBCPriceAttribute(attributes) {
  const keyword = /precio|price|tasa|rate|costo|cost|tarifa|fee|membres|annual|cuota|valor|s\//i;
  const candidates = attributes.filter(attribute => new Set(attribute.levels.map(parseCBCPriceLevel).filter(Number.isFinite)).size >= 2);
  return candidates.find(attribute => keyword.test(attribute.name))?.name ?? null;
}

function computeCBCPriceElasticity(attributes, utilities, priceAttribute, baseProfile = {}) {
  const attribute = attributes.find(candidate => candidate.name === priceAttribute);
  if (!attribute) return { applicable: false, reason: 'NO_PRICE_ATTRIBUTE', points: [] };
  const levels = attribute.levels.map(level => ({ level, price: parseCBCPriceLevel(level) })).filter(point => Number.isFinite(point.price));
  if (new Set(levels.map(point => point.price)).size < 2) return { applicable: false, reason: 'NON_NUMERIC_PRICE_LEVELS', points: [] };
  levels.sort((first, second) => first.price - second.price);
  const points = levels.map(point => {
    const profile = { ...baseProfile, [priceAttribute]: point.level };
    return { ...point, share: simulateCBCShare(attributes, utilities, [profile, null])[0], elasticity: null };
  });
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const averageShare = (current.share + previous.share) / 2;
    const averagePrice = (current.price + previous.price) / 2;
    current.elasticity = averageShare && averagePrice && current.price !== previous.price
      ? ((current.share - previous.share) / averageShare) / ((current.price - previous.price) / averagePrice)
      : null;
  }
  return { applicable: true, priceAttribute, points };
}
