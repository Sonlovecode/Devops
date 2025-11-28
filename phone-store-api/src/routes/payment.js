import { Router } from 'express';
import { Order } from '../models/Order.js';

const router = Router();

/**
 * POST /api/payment/qr
 * body: { orderId }
 */
router.post('/qr', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ============================
    // 🔥 Thông tin MB Bank
    // ============================
    const BANK = {
      bank: 'MB',
      account: '0773315677',
      name: 'CAO LE SON'
    };

    // Nội dung chuyển khoản để hệ thống nhận diện
    const note = `ORDER_${order._id}`;

    // Tạo link QR VietQR
    const qrUrl =
      `https://img.vietqr.io/image/${BANK.bank}-${BANK.account}-compact.png` +
      `?amount=${order.total}` +
      `&addInfo=${encodeURIComponent(note)}` +
      `&accountName=${encodeURIComponent(BANK.name)}`;

    res.json({
      success: true,
      amount: order.total,
      orderId: order._id,
      qrUrl,
      note,
    });
  } catch (err) {
    console.error('QR Generate error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/payment/confirm
 * body: { orderId }
 */
router.post('/confirm', async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Không có webhook → user tự xác nhận
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();

    res.json({ success: true, message: 'Đã xác nhận thanh toán' });

  } catch (err) {
    console.error('Payment Confirm error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
