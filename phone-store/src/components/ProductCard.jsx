import { formatPrice } from '../utils/helpers';

export default function ProductCard({ product, onViewProduct, onAddToCart }) {
  if (!product) return null;

  const productId = product._id ?? product.id;

  const productImage =
    product.images?.[0]?.url ??
    product.img ??
    'https://via.placeholder.com/300x300?text=Phone';

  // Chọn variant mặc định: isDefault, nếu không có thì lấy variant đầu
  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0] || null;

  const rawPrice =
    defaultVariant?.price ??
    product.basePrice ??
    product.price ??
    0;

  const price = Number(rawPrice || 0);
  const oldPrice = Number(product.oldPrice || 0) || null;

  const discountPercent =
    oldPrice && price && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const brandName = product.brand?.name ?? product.brand ?? '';
  const ramGb = defaultVariant?.ramGb ?? product.ram ?? null;
  const romGb = defaultVariant?.romGb ?? product.rom ?? null;

  const conditionText =
    product.condition === 'new'
      ? 'Hàng mới chính hãng'
      : 'Máy cũ đẹp như mới';

  const ratingValue = Number(product.ratingAvg ?? product.rating ?? 0);
  const ratingCount = product.ratingCount ?? product.reviews ?? 0;
  const ratingDisplay =
    ratingValue > 0 ? ratingValue.toFixed(1) : 'Chưa có';
  const ratingSuffix =
    ratingCount > 0 ? `${ratingCount} đánh giá` : 'Chưa có đánh giá';

  const handleView = () => onViewProduct && onViewProduct(productId);

  const handleAddToCart = () => {
    if (!onAddToCart) return;

    // Nếu không có variant (sản phẩm đơn) vẫn tạo payload được
    const payload = {
      productId,
      variantId: defaultVariant?._id || null,
      name: product.name,
      color: defaultVariant?.color || product.color || 'Mặc định',
      ramGb: ramGb || null,
      romGb: romGb || null,
      price: price,
      img: productImage,
    };

    onAddToCart(payload);
  };

  return (
    <div className="product-card">
      <div className="product-card-badges">
        {product.isHotDeal && <span className="badge badge-sale">Deal hot</span>}
        {discountPercent && (
          <span className="badge badge-discount">-{discountPercent}%</span>
        )}
        {product.condition === 'used' && (
          <span className="badge badge-used">Máy cũ đẹp</span>
        )}
      </div>

      <div className="product-img-wrap" onClick={handleView}>
        <img src={productImage} alt={product.name} />
      </div>

      <div className="product-body">
        <div className="product-name" onClick={handleView} title={product.name}>
          {product.name}
        </div>

        <div className="product-meta">
          {brandName && <span className="meta-chip">{brandName}</span>}
          {ramGb && romGb && (
            <span className="meta-chip">
              {ramGb}GB RAM / {romGb}GB
            </span>
          )}
          <span className="meta-chip meta-condition">{conditionText}</span>
        </div>

        <div className="product-price-row">
          <div className="product-price-block">
            <span className="product-price">{formatPrice(price)}</span>
            {oldPrice && (
              <span className="product-price-old">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>
          <div className="product-rating">
            <span className="rating-star">★</span>
            <span className="rating-text">
              {ratingDisplay}{' '}
              <span className="rating-count">· {ratingSuffix}</span>
            </span>
          </div>
        </div>

        <div className="product-actions">
          <button className="btn-sm btn-outline" onClick={handleView}>
            Xem chi tiết
          </button>
          <button className="btn-sm btn-primary" onClick={handleAddToCart}>
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
