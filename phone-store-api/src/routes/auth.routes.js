import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password là bắt buộc' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone: phone || '',
      passwordHash,
      role: 'customer',
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('POST /api/auth/register error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Thiếu email hoặc password' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Tài khoản đã bị khoá' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req, res) => {
  const user = req.user;
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });
});

export default router;
