import mongoose from 'mongoose';
import { Place } from '../models/Place.js';
import { WaitReport } from '../models/WaitReport.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/places
 * Paginated list of places with search, category filtering, and reportCount
 */
export const getPlaces = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const match = {};

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search.trim(), 'i');
    match.$or = [{ name: searchRegex }, { address: searchRegex }];
  }

  if (req.query.category) {
    match.category = req.query.category;
  }

  const [aggregateResult] = await Place.aggregate([
    { $match: match },
    {
      $facet: {
        total: [{ $count: 'count' }],
        places: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'waitreports',
              localField: '_id',
              foreignField: 'place',
              as: 'reports'
            }
          },
          {
            $addFields: {
              id: '$_id',
              reportCount: { $size: '$reports' }
            }
          },
          {
            $project: {
              reports: 0,
              __v: 0
            }
          }
        ]
      }
    }
  ]);

  const total = aggregateResult?.total[0]?.count || 0;
  const places = aggregateResult?.places || [];
  const totalPages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    success: true,
    data: {
      places,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * POST /api/places
 * Create a new place
 */
export const createPlace = asyncHandler(async (req, res) => {
  const { name, category, address } = req.body;

  const place = await Place.create({
    name: name.trim(),
    category,
    address: address ? address.trim() : ''
  });

  res.status(201).json({
    success: true,
    data: {
      ...place.toJSON(),
      reportCount: 0
    }
  });
});

/**
 * GET /api/places/:id
 * Retrieve a single place by ID with reportCount
 */
export const getPlaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const place = await Place.findById(id);
  if (!place) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Place not found'
      }
    });
  }

  const reportCount = await WaitReport.countDocuments({ place: id });

  res.status(200).json({
    success: true,
    data: {
      ...place.toJSON(),
      reportCount
    }
  });
});
