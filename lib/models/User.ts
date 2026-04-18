import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "customer" | "restaurant_owner" | "admin";
  addresses: {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }[];
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema({
  label: { type: String, default: "Home" },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["customer", "restaurant_owner", "admin"],
      default: "customer",
    },
    addresses: [AddressSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure only one default address
UserSchema.pre("save", function (next) {
  const defaultAddresses = this.addresses.filter((a) => a.isDefault);
  if (defaultAddresses.length > 1) {
    this.addresses.forEach((a, i) => {
      a.isDefault = i === 0;
    });
  }
  next();
});

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
