import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String,
      required: [true, 'Main image URL is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: ['WiFi', 'Air Conditioning', 'Room Service'],
    },
    rooms: {
      type: Number,
      default: 50,
      min: [1, 'Must have at least 1 room'],
    },
    type: {
      type: String,
      default: 'Luxury',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const HotelModel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);
