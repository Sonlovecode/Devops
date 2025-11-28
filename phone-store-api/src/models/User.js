import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'customer' }, // customer | admin
    status: { type: String, default: 'active' }, // active | blocked
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
