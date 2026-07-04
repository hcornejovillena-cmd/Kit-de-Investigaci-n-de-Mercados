// Pure TURF engine shared by Education and Own Data workflows.
function calcReachBinary(matrix, portfolio) {
  return matrix.reduce((reach, row) => reach + (portfolio.some(index => row.values[index] >= 1) ? 1 : 0), 0);
}

function calcReachThreshold(matrix, portfolio, threshold) {
  return matrix.reduce((reach, row) => reach + (portfolio.some(index => row.values[index] >= threshold) ? 1 : 0), 0);
}

function calcReachWeighted(matrix, portfolio, itemsPerSet, anchored, probabilityThreshold) {
  const constant = anchored ? 1 : Math.max(1, itemsPerSet - 1);
  return matrix.reduce((reach, row) => {
    const minimum = Math.min(...row.values);
    const maximum = Math.max(...row.values);
    const range = maximum - minimum || 1;
    const exponentialSum = portfolio.reduce((sum, index) => {
      const utility = (row.values[index] - minimum) / range * 2 - 1;
      return sum + Math.exp(utility);
    }, 0);
    return reach + (exponentialSum / (exponentialSum + constant) >= probabilityThreshold ? 1 : 0);
  }, 0);
}

function calcFrequency(matrix, portfolio, type, threshold) {
  let frequency = 0;
  matrix.forEach(row => portfolio.forEach(index => {
    if (type === 'binary' && row.values[index] >= 1) frequency += 1;
    else if (type === 'threshold' && row.values[index] >= threshold) frequency += 1;
    else if (type === 'weighted' && row.values[index] > 0) frequency += 1;
  }));
  return frequency;
}

function getCombinations(itemCount, size) {
  const result = [];
  const combination = [];
  function visit(start) {
    if (combination.length === size) { result.push([...combination]); return; }
    for (let index = start; index < itemCount; index += 1) {
      combination.push(index);
      visit(index + 1);
      combination.pop();
    }
  }
  visit(0);
  return result;
}

function computeTURF(matrix, items, options = {}) {
  if (!Array.isArray(matrix) || matrix.length === 0) throw new TypeError('TURF requires respondent data.');
  if (!Array.isArray(items) || items.length < 2) throw new TypeError('TURF requires at least two items.');
  if (matrix.some(row => !Array.isArray(row.values) || row.values.length !== items.length)) {
    throw new RangeError('Every TURF row must contain one value per item.');
  }

  const type = options.type ?? 'binary';
  const threshold = options.threshold ?? 0.5;
  const itemsPerSet = options.itemsPerSet ?? 4;
  const anchored = options.anchored ?? false;
  const probabilityThreshold = options.probabilityThreshold ?? 0.3;
  const kmax = Math.min(options.kmax ?? items.length, items.length);
  const topN = options.topN ?? 10;
  const optimizeBy = options.optimizeBy ?? 'reach';
  const respondentCount = matrix.length;

  const getReach = portfolio => {
    if (type === 'binary') return calcReachBinary(matrix, portfolio);
    if (type === 'threshold') return calcReachThreshold(matrix, portfolio, threshold);
    return calcReachWeighted(matrix, portfolio, itemsPerSet, anchored, probabilityThreshold);
  };
  const compare = (first, second) => optimizeBy === 'reach_freq'
    ? second.reach - first.reach || second.freq - first.freq
    : second.reach - first.reach;

  const allResults = [];
  const bestByK = [];
  for (let size = 1; size <= kmax; size += 1) {
    const results = getCombinations(items.length, size).map(combo => {
      const reach = getReach(combo);
      const freq = calcFrequency(matrix, combo, type, threshold);
      return { combo, k: size, reach, reachPct: reach / respondentCount * 100, freq, avgFreq: reach > 0 ? freq / reach : 0 };
    });
    results.sort(compare);
    allResults.push(...results);
    bestByK.push({ k: size, best: results[0] });
  }
  allResults.sort(compare);

  const overlap = Array.from({ length: items.length }, (_, firstIndex) =>
    Array.from({ length: items.length }, (_, secondIndex) => {
      if (firstIndex === secondIndex) return 100;
      let both = 0;
      let either = 0;
      matrix.forEach(row => {
        const firstReached = type === 'binary' ? row.values[firstIndex] >= 1
          : type === 'threshold' ? row.values[firstIndex] >= threshold : row.values[firstIndex] > 0;
        const secondReached = type === 'binary' ? row.values[secondIndex] >= 1
          : type === 'threshold' ? row.values[secondIndex] >= threshold : row.values[secondIndex] > 0;
        if (firstReached && secondReached) both += 1;
        if (firstReached || secondReached) either += 1;
      });
      return either > 0 ? Math.round(both / either * 100) : 0;
    }));

  return { topResults: allResults.slice(0, topN), bestByK, overlap, N: respondentCount, type, kmax };
}

function createTurfRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  };
}

function calcShapleyPortfolio(data, portfolio, getReach, maxPermutations = 10000) {
  const size = portfolio.length;
  let shapley = new Array(size).fill(0);
  let permutationCount = 0;

  function* permutations(values) {
    if (values.length <= 1) { yield values; return; }
    for (let index = 0; index < values.length; index += 1) {
      const remaining = [...values.slice(0, index), ...values.slice(index + 1)];
      for (const permutation of permutations(remaining)) yield [values[index], ...permutation];
    }
  }

  const factorial = value => value <= 1 ? 1 : value * factorial(value - 1);
  const exact = factorial(size) <= maxPermutations;

  if (exact) {
    for (const permutation of permutations([...Array(size).keys()])) {
      let previousReach = 0;
      const currentPortfolio = [];
      permutation.forEach(position => {
        currentPortfolio.push(portfolio[position]);
        const reach = getReach(currentPortfolio);
        shapley[position] += reach - previousReach;
        previousReach = reach;
      });
      permutationCount += 1;
    }
  } else {
    const random = createTurfRandom(42);
    const samples = Math.min(maxPermutations, 5000);
    for (let sample = 0; sample < samples; sample += 1) {
      const permutation = [...Array(size).keys()];
      for (let index = size - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [permutation[index], permutation[swapIndex]] = [permutation[swapIndex], permutation[index]];
      }
      let previousReach = 0;
      const currentPortfolio = [];
      permutation.forEach(position => {
        currentPortfolio.push(portfolio[position]);
        const reach = getReach(currentPortfolio);
        shapley[position] += reach - previousReach;
        previousReach = reach;
      });
      permutationCount += 1;
    }
  }

  shapley = shapley.map(value => value / permutationCount);
  return { shapley, exact, permCount: permutationCount };
}

function calcShapleyGeneral(data, itemCount, getReach, averageScores) {
  const portfolioSizes = [3, 4, 5];
  const random = createTurfRandom(137);
  const shapley = new Array(itemCount).fill(0);
  const counts = new Array(itemCount).fill(0);

  portfolioSizes.forEach(size => {
    if (size > itemCount) return;
    const allItems = [...Array(itemCount).keys()];
    const samplesPerItem = 200;
    for (let item = 0; item < itemCount; item += 1) {
      const otherItems = allItems.filter(index => index !== item);
      for (let sample = 0; sample < samplesPerItem; sample += 1) {
        const shuffled = [...otherItems].sort(() => random() - 0.5);
        const base = shuffled.slice(0, size - 1);
        shapley[item] += getReach([...base, item]) - getReach(base);
        counts[item] += 1;
      }
    }
  });

  const avgShapley = shapley.map((value, index) => counts[index] > 0 ? value / counts[index] : 0);
  const minimum = Math.min(...avgShapley);
  const shifted = avgShapley.map(value => value - minimum);
  const total = shifted.reduce((sum, value) => sum + value, 0) || 1;
  let runningSum = 0;
  const pct = shifted.map((value, index) => {
    if (index === itemCount - 1) return Math.round((100 - runningSum) * 10) / 10;
    const percentage = Math.round(value / total * 1000) / 10;
    runningSum += percentage;
    return percentage;
  });
  return { avgShapley, pct };
}
