import mongoose from 'mongoose';

// fake userId, sau này thay bằng JWT
const DUMMY_USER_ID = new mongoose.Types.ObjectId('64f0c783f5a0c0f5b4d00001');

export function fakeAuth(req, res, next) {
  // Nếu muốn cho phép guest checkout: có thể set null
  req.userId = DUMMY_USER_ID;
  next();
}
