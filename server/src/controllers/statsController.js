import mongoose from 'mongoose';
import { Place } from '../models/Place.js';
import { WaitReport } from '../models/WaitReport.js';
import { TIME_PERIODS } from '../utils/timeBuckets.js';
import { computePeriodStats } from '../utils/percentile.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/places/:id/stats
 * Returns typical wait ranges grouped by timePeriod with 90-day cutoff,
 * optional dayType filter, and source: "user-reported"
 */
export const getPlaceStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { dayType } = req.query;

  // Check if place exists
  const placeExists = await Place.exists({ _id: id });
  if (!placeExists) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Place not found'
      }
    });
  }

  // 90-day window cutoff
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const filter = {
    place: new mongoose.Types.ObjectId(id),
    visitedAt: { $gte: ninetyDaysAgo }
  };

  if (dayType && dayType !== 'All') {
    filter.dayType = dayType;
  }

  // Fetch waitMinutes grouped by timePeriod
  const reports = await WaitReport.find(filter, {
    timePeriod: 1,
    waitMinutes: 1,
    dayType: 1
  }).lean();

  // Group wait minutes by time period
  const periodMap = new Map();
  for (const period of TIME_PERIODS) {
    periodMap.set(period, []);
  }

  for (const r of reports) {
    if (periodMap.has(r.timePeriod)) {
      periodMap.get(r.timePeriod).push(r.waitMinutes);
    }
  }

  // Compute statistics for all 5 buckets in order
  const periods = TIME_PERIODS.map((periodName) => {
    const waitTimes = periodMap.get(periodName) || [];
    const stats = computePeriodStats(periodName, waitTimes);
    return {
      ...stats,
      source: 'user-reported'
    };
  });

  res.status(200).json({
    success: true,
    data: {
      placeId: id,
      dayType: dayType || 'All',
      source: 'user-reported',
      totalReports90Days: reports.length,
      periods
    }
  });
});
