import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItemDocument {
  menuItemId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  foodType: "veg" | "non-veg" | "egg";
}

export interface ICartDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItemDocument[];
}

const CartItemSchema = new Schema<ICartItemDocument>({
  menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: String,
  quantity: { type: Number, required: true, min: 1, default: 1 },
  foodType: { type: String, enum: ["veg", "non-veg", "egg"], default: "veg" },
});

const CartSchema = new Schema<ICartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

// Virtual: group items by restaurant
CartSchema.virtual("groupedItems").get(function () {
  const groups: Record<
    string,
    { restaurantId: string; items: ICartItemDocument[] }
  > = {};
  this.items.forEach((item) => {
    const rid = item.restaurantId.toString();
    if (!groups[rid]) groups[rid] = { restaurantId: rid, items: [] };
    groups[rid].items.push(item);
  });
  return Object.values(groups);
});

const Cart: Model<ICartDocument> =
  mongoose.models.Cart || mongoose.model<ICartDocument>("Cart", CartSchema);

export default Cart;
