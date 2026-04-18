import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Category ────────────────────────────────────────────────────────────────
export interface ICategoryDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>("Category", CategorySchema);

// ─── MenuItem ────────────────────────────────────────────────────────────────
export interface IMenuItemDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  foodType: "veg" | "non-veg" | "egg";
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number;
}

const MenuItemSchema = new Schema<IMenuItemDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    image: String,
    foodType: {
      type: String,
      enum: ["veg", "non-veg", "egg"],
      default: "veg",
    },
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    preparationTime: { type: Number, default: 15 }, // minutes
  },
  { timestamps: true }
);

MenuItemSchema.index({ restaurantId: 1, categoryId: 1 });

export const MenuItem: Model<IMenuItemDocument> =
  mongoose.models.MenuItem ||
  mongoose.model<IMenuItemDocument>("MenuItem", MenuItemSchema);
