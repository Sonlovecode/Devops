import mongoose from 'mongoose';

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // 'percent' | 'fixed'
    value: { type: Number, required: true },
    startAt: { type: Date },
    endAt: { type: Date },
    minOrderTotal: { type: Number },
    maxDiscount: { type: Number },
    status: { type: String, default: 'active' }, // active | disabled
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', couponSchema);
