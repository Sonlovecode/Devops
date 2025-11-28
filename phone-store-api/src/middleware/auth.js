import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function authOptional(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      req.user = null;
      req.userId = null;
      return next();
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    console.error('authOptional error:', err.message);
    req.user = null;
    req.userId = null;
    next();
  }
}

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Thiếu token Authorization' });
    }
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Tài khoản đã bị khoá' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    console.error('requireAuth error:', err.message);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới được truy cập' });
  }
  next();
}
