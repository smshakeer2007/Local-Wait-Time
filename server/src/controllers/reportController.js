import mongoose from 'mongoose';
import { Place } from '../models/Place.js';
import { WaitReport } from '../models/WaitReport.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/places/:id/reports
 * Submit a wait time report for a place
 */
export const createReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { waitMinutes, visitedAt, note } = req.body;

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

  const report = await WaitReport.create({
    place: id,
    waitMinutes: Number(waitMinutes),
    visitedAt: new Date(visitedAt),
    note: note || ''
  });

  res.status(201).json({
    success: true,
    data: {
      ...report.toJSON(),
      source: 'user-reported'
    }
  });
});

/**
 * GET /api/places/:id/reports
 * Retrieve recent wait time reports for a place
 */
export const getReportsByPlace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const page = parseInt(req.query.page, 10) || 1;
  const skip = (page - 1) * limit;

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

  const [reports, total] = await Promise.all([
    WaitReport.find({ place: id })
      .sort({ visitedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WaitReport.countDocuments({ place: id })
  ]);

  const formattedReports = reports.map((r) => ({
    ...r,
    id: r._id,
    source: 'user-reported'
  }));

  res.status(200).json({
    success: true,
    data: {
      reports: formattedReports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    }
  });
});
