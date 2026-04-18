import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRestaurantDocument extends Document {
  name: string;
  description: string;
  cuisineTypes: string[];
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
  };
  coverImage?: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  avgDeliveryTime: number;
  minOrderAmount: number;
  deliveryFee: number;
  isOpen: boolean;
  isActive: boolean;
  ownerId: mongoose.Types.ObjectId;
}

const RestaurantSchema = new Schema<IRestaurantDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    cuisineTypes: [{ type: String }],
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    coverImage: String,
    logo: String,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    avgDeliveryTime: { type: Number, default: 30 }, // minutes
    minOrderAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Text index for search
RestaurantSchema.index({ name: "text", description: "text" });

const Restaurant: Model<IRestaurantDocument> =
  mongoose.models.Restaurant ||
  mongoose.model<IRestaurantDocument>("Restaurant", RestaurantSchema);

export default Restaurant;
