// Pure Newton-Miller-Smith engine. It composes the shared Van Westendorp engine.
const NMS_PURCHASE_PROBABILITY = { 5: 0.70, 4: 0.50, 3: 0.30, 2: 0.10, 1: 0.00 };

function computeNMS(raw, options = {}) {
  const minRows = options.minRows ?? 10;
  const records = Array.isArray(raw) ? raw : [];
  const valid = records.filter(record => {
    const veryCheap = Number(record.muy_barato);
    const cheap = Number(record.barato);
    const expensive = Number(record.caro);
    const veryExpensive = Number(record.muy_caro);
    const cheapIntent = Number(record.intent_barato);
    const expensiveIntent = Number(record.intent_caro);
    return veryCheap > 0 && cheap > 0 && expensive > 0 && veryExpensive > 0
      && veryCheap <= cheap && cheap <= expensive && expensive <= veryExpensive
      && cheapIntent >= 1 && cheapIntent <= 5
      && expensiveIntent >= 1 && expensiveIntent <= 5;
  });

  if (valid.length < minRows) {
    const error = new RangeError(`NMS requires at least ${minRows} valid rows.`);
    error.code = 'NMS_MIN_ROWS';
    error.validRows = valid.length;
    throw error;
  }

  const psm = computeVanWestendorp(valid, { minRows });
  const minimumPrice = Math.min(...valid.map(record => Number(record.muy_barato)));
  const maximumPrice = Math.max(...valid.map(record => Number(record.muy_caro)));
  const step = Math.max(1, Math.round((maximumPrice - minimumPrice) / 60));
  const priceRange = [];
  for (let price = minimumPrice; price <= maximumPrice; price += step) priceRange.push(price);

  const demand = priceRange.map(price => {
    let totalProbability = 0;
    valid.forEach(record => {
      const veryCheap = Number(record.muy_barato);
      const cheap = Number(record.barato);
      const expensive = Number(record.caro);
      const veryExpensive = Number(record.muy_caro);
      const cheapProbability = NMS_PURCHASE_PROBABILITY[Number(record.intent_barato)] || 0;
      const expensiveProbability = NMS_PURCHASE_PROBABILITY[Number(record.intent_caro)] || 0;
      let probability = 0;

      if (price <= veryCheap) probability = 0;
      else if (price <= cheap) probability = cheapProbability * (price - veryCheap) / (cheap - veryCheap || 1);
      else if (price <= expensive) {
        probability = cheapProbability
          + (expensiveProbability - cheapProbability) * (price - cheap) / (expensive - cheap || 1);
      } else if (price <= veryExpensive) {
        probability = expensiveProbability * (1 - (price - expensive) / (veryExpensive - expensive || 1));
      }

      totalProbability += Math.max(0, Math.min(1, probability));
    });
    return { price, demand_pct: totalProbability / valid.length * 100 };
  });

  const revenue = demand.map(point => ({ price: point.price, rev: point.price * point.demand_pct }));
  const maxDemand = demand.reduce((first, second) => first.demand_pct > second.demand_pct ? first : second);
  const maxRev = revenue.reduce((first, second) => first.rev > second.rev ? first : second);

  return {
    prices: psm.prices,
    curve: psm.curve,
    PMC: psm.PMC,
    PME: psm.PME,
    OPP: psm.OPP,
    IPP: psm.IPP,
    stats: psm.stats,
    valid,
    excluded: records.length - valid.length,
    demand,
    revenue,
    maxDemand,
    maxRev
  };
}
