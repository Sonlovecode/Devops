import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = Router();

/**
 * GET /api/users  (admin)
 * Lấy danh sách tất cả user (ẩn password)
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-passwordHash -__v')
      .lean();

    res.json(users);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PATCH /api/users/:id  (admin)
 * body: { role?, status? }
 *  - role: 'admin' | 'customer'
 *  - status: 'active' | 'blocked'
 */
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const update = {};
    const allowedRoles = ['admin', 'customer'];
    const allowedStatus = ['active', 'blocked'];

    if (role) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Role không hợp lệ' });
      }
      update.role = role;
    }

    if (status) {
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Status không hợp lệ' });
      }
      update.status = status;
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: 'Không có gì để cập nhật' });
    }

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
    })
      .select('-passwordHash -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }

    res.json(user);
  } catch (err) {
    console.error('PATCH /api/users/:id error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
