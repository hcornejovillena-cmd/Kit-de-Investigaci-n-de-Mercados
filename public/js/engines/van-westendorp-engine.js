// Pure statistical engine shared by Education and Own Data workflows.
function computeVanWestendorp(raw, options = {}) {
  const minRows = options.minRows ?? 10;
  const records = Array.isArray(raw) ? raw : [];
  const valid = records.filter(record => {
    const veryCheap = Number(record.muy_barato);
    const cheap = Number(record.barato);
    const expensive = Number(record.caro);
    const veryExpensive = Number(record.muy_caro);
    return veryCheap > 0 && cheap > 0 && expensive > 0 && veryExpensive > 0
      && veryCheap <= cheap && cheap <= expensive && expensive <= veryExpensive;
  });

  if (valid.length < minRows) {
    const error = new RangeError(`Van Westendorp requires at least ${minRows} valid rows.`);
    error.code = 'VW_MIN_ROWS';
    error.validRows = valid.length;
    throw error;
  }

  const allPrices = new Set();
  valid.forEach(record => {
    ['muy_barato', 'barato', 'caro', 'muy_caro'].forEach(field => allPrices.add(Number(record[field])));
  });
  const prices = [...allPrices].sort((a, b) => a - b);
  const sampleSize = valid.length;
  const curve = {};

  prices.forEach(price => {
    curve[price] = {
      tc: valid.filter(record => Number(record.muy_barato) >= price).length / sampleSize * 100,
      ch: valid.filter(record => Number(record.barato) >= price).length / sampleSize * 100,
      exp: valid.filter(record => Number(record.caro) <= price).length / sampleSize * 100,
      texp: valid.filter(record => Number(record.muy_caro) <= price).length / sampleSize * 100
    };
  });

  function findIntersection(firstCurve, secondCurve) {
    for (let index = 0; index < prices.length - 1; index += 1) {
      const firstPrice = prices[index];
      const secondPrice = prices[index + 1];
      const a1 = curve[firstPrice][firstCurve];
      const a2 = curve[secondPrice][firstCurve];
      const b1 = curve[firstPrice][secondCurve];
      const b2 = curve[secondPrice][secondCurve];
      if ((a1 - b1) * (a2 - b2) <= 0) {
        const denominator = (a2 - a1) - (b2 - b1);
        const fraction = denominator === 0 ? 0 : (b1 - a1) / denominator;
        return {
          price: firstPrice + fraction * (secondPrice - firstPrice),
          pct: a1 + fraction * (a2 - a1)
        };
      }
    }

    let bestPrice = prices[0];
    let bestDistance = Infinity;
    prices.forEach(price => {
      const distance = Math.abs(curve[price][firstCurve] - curve[price][secondCurve]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestPrice = price;
      }
    });
    return { price: bestPrice, pct: curve[bestPrice][firstCurve] };
  }

  const stats = {};
  ['muy_barato', 'barato', 'caro', 'muy_caro'].forEach(field => {
    const values = valid.map(record => Number(record[field])).sort((a, b) => a - b);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const median = values.length % 2 === 0
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)];
    const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
    stats[field] = {
      mean: mean.toFixed(1),
      median: median.toFixed(1),
      sd: sd.toFixed(1),
      min: values[0],
      max: values[values.length - 1]
    };
  });

  return {
    prices,
    curve,
    PMC: findIntersection('tc', 'exp'),
    PME: findIntersection('ch', 'texp'),
    OPP: findIntersection('tc', 'texp'),
    IPP: findIntersection('ch', 'exp'),
    stats,
    valid,
    excluded: records.length - valid.length
  };
}
