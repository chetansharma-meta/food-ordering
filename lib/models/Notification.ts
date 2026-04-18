import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: "order_placed" | "status_update" | "general";
  title: string;
  message: string;
  orderId?: mongoose.Types.ObjectId;
  isRead: boolean;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["order_placed", "status_update", "general"],
      default: "general",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// TTL index: auto-delete notifications older than 30 days
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);

export default Notification;
