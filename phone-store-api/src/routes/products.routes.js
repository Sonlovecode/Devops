// src/routes/products.routes.js
import { Router } from 'express';
import { Product } from '../models/Product.js';
import { Brand } from '../models/Brand.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/products
 * Lấy danh sách sản phẩm + filter + sort + phân trang
 */
router.get('/', async (req, res) => {
  try {
    const {
      brand,
      minPrice,
      maxPrice,
      condition,
      q,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const take = Number(limit) || 20;
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * take;

    const query = {};

    if (condition) {
      query.condition = condition; // 'new' | 'used'
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (brand) {
      const brandDoc = await Brand.findOne({
        $or: [{ slug: brand }, { name: brand }],
      });

      if (brandDoc) {
        query.brand = brandDoc._id;
      } else {
        // Không có brand đó thì trả list rỗng
        return res.json({
          data: [],
          pagination: {
            total: 0,
            page: currentPage,
            limit: take,
            pages: 0,
          },
        });
      }
    }

    // Sort
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { basePrice: 1 };
    else if (sort === 'price_desc') sortOption = { basePrice: -1 };
    else if (sort === 'rating') sortOption = { ratingAvg: -1 };

    // Filter theo khoảng giá
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    const [items, total] = await Promise.all([
      Product.find(query)
        .populate('brand')
        .sort(sortOption)
        .skip(skip)
        .limit(take)
        .lean(),
      Product.countDocuments(query),
    ]);

    return res.json({
      data: items,
      pagination: {
        total,
        page: currentPage,
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error('GET /api/products error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate('brand').lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (err) {
    console.error('GET /api/products/:id error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/products  (admin)
 */
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      brandSlug,
      basePrice,
      oldPrice,
      condition,
      description,
      variants,
      images,
      isHotDeal,
    } = req.body;

    if (!name || basePrice == null) {
      return res.status(400).json({ message: 'name & basePrice required' });
    }

    let brandDoc = null;
    if (brandSlug) {
      brandDoc = await Brand.findOne({ slug: brandSlug });
      if (!brandDoc) {
        brandDoc = await Brand.create({ name: brandSlug, slug: brandSlug });
      }
    }

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const exists = await Product.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: 'Product slug already exists' });
    }

    const product = await Product.create({
      name,
      slug,
      brand: brandDoc?._id,
      basePrice,
      oldPrice: oldPrice || null,
      condition: condition || 'new',
      description: description || '',
      isHotDeal: !!isHotDeal,
      variants: (variants || []).map((v) => ({
        color: v.color,
        ramGb: v.ramGb,
        romGb: v.romGb,
        price: v.price || basePrice,
        stockQty: v.stockQty || 0,
        sku: v.sku,
        isDefault: !!v.isDefault,
      })),
      images: (images || []).map((url, index) => ({
        url: typeof url === 'string' ? url : url.url,
        isPrimary:
          typeof url === 'object'
            ? !!url.isPrimary
            : index === 0,
      })),
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error('POST /api/products error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/products/:id  (admin) – cập nhật
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      brandSlug,
      basePrice,
      oldPrice,
      condition,
      description,
      variants,
      images,
      isHotDeal,
      ratingAvg,
      ratingCount,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (brandSlug) {
      let brandDoc = await Brand.findOne({ slug: brandSlug });
      if (!brandDoc) {
        brandDoc = await Brand.create({ name: brandSlug, slug: brandSlug });
      }
      product.brand = brandDoc._id;
    }

    if (name) {
      product.name = name;
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      product.slug = slug;
    }

    if (basePrice != null) product.basePrice = basePrice;
    if (oldPrice != null) product.oldPrice = oldPrice;
    if (condition) product.condition = condition;
    if (description != null) product.description = description;
    if (typeof isHotDeal === 'boolean') product.isHotDeal = isHotDeal;
    if (ratingAvg != null) product.ratingAvg = ratingAvg;
    if (ratingCount != null) product.ratingCount = ratingCount;

    if (Array.isArray(variants)) {
      product.variants = variants.map((v) => ({
        color: v.color,
        ramGb: v.ramGb,
        romGb: v.romGb,
        price: v.price || basePrice || product.basePrice,
        stockQty: v.stockQty || 0,
        sku: v.sku,
        isDefault: !!v.isDefault,
      }));
    }

    if (Array.isArray(images)) {
      product.images = images.map((url, index) => ({
        url: typeof url === 'string' ? url : url.url,
        isPrimary:
          typeof url === 'object'
            ? !!url.isPrimary
            : index === 0,
      }));
    }

    await product.save();
    return res.json(product);
  } catch (err) {
    console.error('PUT /api/products/:id error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/products/:id  (admin)
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /api/products/:id error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
