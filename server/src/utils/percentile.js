/**
 * Calculates a given percentile (0 to 1) for a sorted numeric array.
 * Uses standard linear interpolation.
 */
export function calculatePercentile(sortedValues, p) {
  if (!sortedValues || sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];

  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedValues[lower];
  }

  const weight = index - lower;
  const interpolated = sortedValues[lower] + weight * (sortedValues[upper] - sortedValues[lower]);
  return Math.round(interpolated);
}

/**
 * Computes wait time statistics for a list of wait report documents or numbers.
 */
export function computePeriodStats(timePeriod, waitMinutesArray) {
  const count = waitMinutesArray.length;

  if (count === 0) {
    return {
      timePeriod,
      reportCount: 0,
      minWait: null,
      maxWait: null,
      medianWait: null,
      typicalRange: null,
      insufficient: true
    };
  }

  const sorted = [...waitMinutesArray].sort((a, b) => a - b);
  const minWait = sorted[0];
  const maxWait = sorted[sorted.length - 1];
  const medianWait = calculatePercentile(sorted, 0.5);

  if (count < 3) {
    return {
      timePeriod,
      reportCount: count,
      minWait,
      maxWait,
      medianWait,
      typicalRange: null,
      insufficient: true
    };
  }

  const low = calculatePercentile(sorted, 0.25);
  const high = calculatePercentile(sorted, 0.75);

  return {
    timePeriod,
    reportCount: count,
    minWait,
    maxWait,
    medianWait,
    typicalRange: {
      low,
      high
    },
    insufficient: false
  };
}
