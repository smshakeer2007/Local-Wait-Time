import mongoose from 'mongoose';
import { TIME_PERIODS, DAY_TYPES, deriveTimePeriodAndDayType } from '../utils/timeBuckets.js';
import { sanitizeNote } from '../utils/sanitize.js';

const waitReportSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: [true, 'Place ID is required'],
      index: true
    },
    waitMinutes: {
      type: Number,
      required: [true, 'Wait duration in minutes is required'],
      min: [0, 'Wait time cannot be negative'],
      max: [240, 'Wait time cannot exceed 240 minutes (4 hours)'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value for wait minutes'
      }
    },
    visitedAt: {
      type: Date,
      required: [true, 'Visit date and time is required'],
      validate: [
        {
          validator: function (val) {
            // Cannot be in the future (allow 5 min buffer for clock drift)
            return val.getTime() <= Date.now() + 5 * 60 * 1000;
          },
          message: 'Visit time cannot be in the future'
        },
        {
          validator: function (val) {
            // Not older than 30 days
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            return val.getTime() >= thirtyDaysAgo;
          },
          message: 'Visit time cannot be older than 30 days'
        }
      ]
    },
    note: {
      type: String,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default: ''
    },
    timePeriod: {
      type: String,
      required: true,
      enum: TIME_PERIODS
    },
    dayType: {
      type: String,
      required: true,
      enum: DAY_TYPES
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index for efficient recent reports and stats filtering
waitReportSchema.index({ place: 1, visitedAt: -1 });
waitReportSchema.index({ place: 1, dayType: 1, visitedAt: -1 });

// Ensure timePeriod and dayType are derived server-side before validation
waitReportSchema.pre('validate', function (next) {
  if (this.visitedAt) {
    try {
      const derived = deriveTimePeriodAndDayType(this.visitedAt);
      this.timePeriod = derived.timePeriod;
      this.dayType = derived.dayType;
    } catch (err) {
      return next(err);
    }
  }
  if (this.note) {
    this.note = sanitizeNote(this.note);
  }
  next();
});

export const WaitReport = mongoose.model('WaitReport', waitReportSchema);
