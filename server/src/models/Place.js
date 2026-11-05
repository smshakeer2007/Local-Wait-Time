import mongoose from 'mongoose';

export const PLACE_CATEGORIES = [
  'Copy Shop',
  'Bank',
  'Post Office',
  'Government Office',
  'Clinic/Pharmacy',
  'Other'
];

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: PLACE_CATEGORIES,
        message: '{VALUE} is not a valid category'
      }
    },
    address: {
      type: String,
      trim: true,
      maxlength: [160, 'Address cannot exceed 160 characters'],
      default: ''
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

// Compound unique index on name and address
placeSchema.index({ name: 1, address: 1 }, { unique: true });

export const Place = mongoose.model('Place', placeSchema);
