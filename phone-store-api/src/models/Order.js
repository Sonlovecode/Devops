import mongoose from 'mongoose';

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    color: { type: String },
    ramGb: { type: Number },
    romGb: { type: Number },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: true }
);

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    note: { type: String },

    status: {
      type: String,
      default: 'Pending', // Pending, Confirmed, Packed, Shipped, Delivered, Returned
    },
    paymentMethod: { type: String, required: true }, // cod | bank | vnpay
    paymentStatus: { type: String, default: 'unpaid' }, // unpaid | paid | refunded

    couponCode: { type: String },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    items: [orderItemSchema],
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
