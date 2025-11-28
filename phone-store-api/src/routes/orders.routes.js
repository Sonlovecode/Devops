import { Router } from 'express';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { authOptional, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/orders
 */
router.post('/', authOptional, async (req, res) => {
  try {
    const {
      fullName,
      phone,
      address,
      city,
      note,
      paymentMethod,
      couponCode,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }
    if (!fullName || !phone || !address || !city || !paymentMethod) {
      return res
        .status(400)
        .json({ message: 'Thiếu thông tin giao hàng / thanh toán' });
    }

    let subtotal = 0;
    const orderItemsData = [];

    for (const cartItem of items) {
      const productId = cartItem.productId;
      const variantId = cartItem.variantId;
      const quantity = cartItem.quantity || 1;

      if (!productId || !variantId) {
        return res.status(400).json({ message: 'productId & variantId required' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ message: 'Sản phẩm không tồn tại' });
      }

      const variant = product.variants.id(variantId);
      if (!variant) {
        return res
          .status(400)
          .json({ message: `Không tìm thấy variant cho sản phẩm ${product.name}` });
      }

      if (variant.stockQty < quantity) {
        return res.status(400).json({
          message: `Sản phẩm ${product.name} (${variant.color || ''} ${
            variant.ramGb || ''
          }/${variant.romGb || ''}) không đủ tồn kho`,
        });
      }

      const unitPrice = variant.price;
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      orderItemsData.push({
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        color: variant.color,
        ramGb: variant.ramGb,
        romGb: variant.romGb,
        unitPrice,
        quantity,
        lineTotal,
      });
    }

    const shippingFee = 30000;
    let discount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const now = new Date();
      const code = couponCode.toUpperCase();
      const coupon = await Coupon.findOne({ code });

      if (!coupon) {
        return res.status(400).json({ message: 'Mã giảm giá không hợp lệ' });
      }
      if (coupon.status !== 'active') {
        return res.status(400).json({ message: 'Mã giảm giá đã hết hạn / bị khoá' });
      }
      if ((coupon.startAt && coupon.startAt > now) || (coupon.endAt && coupon.endAt < now)) {
        return res.status(400).json({ message: 'Mã giảm giá không còn hiệu lực' });
      }
      if (coupon.minOrderTotal && subtotal < coupon.minOrderTotal) {
        return res.status(400).json({
          message: `Đơn hàng tối thiểu ${coupon.minOrderTotal} mới dùng được mã này`,
        });
      }

      if (coupon.type === 'percent') {
        discount = Math.floor((subtotal * coupon.value) / 100);
      } else if (coupon.type === 'fixed') {
        discount = coupon.value;
      }

      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }

      appliedCouponCode = code;
    }

    const total = subtotal + shippingFee - discount;

    try {
      // Tạo đơn hàng
      const order = await Order.create({
        userId: req.userId || null,
        fullName,
        phone,
        address,
        city,
        note: note || '',
        paymentMethod,
        couponCode: appliedCouponCode,
        subtotal,
        shippingFee,
        discount,
        total,
        items: orderItemsData,
      });

      // Trừ tồn kho cho từng item
      for (const cartItem of items) {
        await Product.updateOne(
          { _id: cartItem.productId, 'variants._id': cartItem.variantId },
          { $inc: { 'variants.$.stockQty': -cartItem.quantity } },
        );
      }

      res.status(201).json(order);
    } catch (err) {
      console.error('Create order error:', err);
      return res
        .status(500)
        .json({ message: 'Không thể tạo đơn hàng', error: err.message });
    }
  } catch (err) {
    console.error('POST /api/orders error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/orders/my
 */
router.get('/my', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders/my error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/orders (admin)
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
/**
 * PATCH /api/orders/:id/status  (admin)
 * body: { status }
 */
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const ALLOWED_STATUS = [
      'Pending',
      'Confirmed',
      'Packed',
      'Shipped',
      'Delivered',
      'Returned',
    ];

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!order) {
      return res.status(404).json({ message: 'Order không tồn tại' });
    }

    res.json(order);
  } catch (err) {
    console.error('PATCH /api/orders/:id/status error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
/**
 * PUT /api/orders/:id/status  (admin)
 * body: { status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' }
 */
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = [
      'pending',
      'confirmed',
      'packed',
      'shipped',
      'delivered',
      'returned',
      'cancelled',
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('PUT /api/orders/:id/status error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
