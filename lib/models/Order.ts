import mongoose, { Schema, Document, Model } from "mongoose";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface IOrderItemDocument {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  foodType: "veg" | "non-veg" | "egg";
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface IOrderDocument extends Document {
  orderId: string; // FO-XXXXX (human readable)
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  restaurantName: string;
  items: IOrderItemDocument[];
  deliveryAddress: {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalAmount: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: "cash_on_delivery";
  paymentStatus: "pending" | "paid";
  statusHistory: IStatusHistoryEntry[];
  estimatedDeliveryTime?: Date;
  notes?: string;
  // For multi-restaurant: link orders placed together
  groupOrderId?: string;
}

const OrderItemSchema = new Schema<IOrderItemDocument>({
  menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: String,
  foodType: { type: String, enum: ["veg", "non-veg", "egg"], default: "veg" },
});

const StatusHistorySchema = new Schema<IStatusHistoryEntry>({
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  note: String,
});

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderId: { type: String, unique: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    restaurantName: { type: String, required: true },
    items: [OrderItemSchema],
    deliveryAddress: {
      label: String,
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    paymentMethod: { type: String, default: "cash_on_delivery" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    statusHistory: [StatusHistorySchema],
    estimatedDeliveryTime: Date,
    notes: String,
    groupOrderId: { type: String, index: true }, // links orders from same checkout
  },
  { timestamps: true }
);

// Auto-generate human-readable order ID
OrderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const count = await mongoose.models.Order.countDocuments();
    this.orderId = `FO-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);

export default Order;
