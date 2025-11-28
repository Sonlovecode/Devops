import mongoose from 'mongoose';

const { Schema } = mongoose;

const productVariantSchema = new Schema(
  {
    color: { type: String },
    ramGb: { type: Number },
    romGb: { type: Number },
    price: { type: Number, required: true },
    stockQty: { type: Number, default: 0 },
    sku: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const productImageSchema = new Schema(
  {
    url: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true }
);

const productSchema = new Schema(
  {
    brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    oldPrice: { type: Number },
    condition: { type: String, default: 'new' }, // new | used
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isHotDeal: { type: Boolean, default: false },
    variants: [productVariantSchema],
    images: [productImageSchema],
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
