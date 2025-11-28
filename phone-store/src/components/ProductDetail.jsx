import { useEffect, useMemo } from 'react';
import { formatPrice } from '../utils/helpers';
import { useProductDetail } from '../hooks/useProductDetail';

export default function ProductDetail({
  currentProductId,
  currentVariant,
  setCurrentVariant,
  onAddToCart,
  onBuyNow,
  setPage,
}) {
  const { product: currentProduct } = useProductDetail(currentProductId);

  // Khi load product lần đầu, set variant default
  useEffect(() => {
    if (!currentProduct) return;

    const firstVariant = currentProduct.variants?.[0];

    if (!currentVariant.color && !currentVariant.rom) {
      setCurrentVariant({
        color: firstVariant?.color || currentProduct.color || 'Mặc định',
        rom: firstVariant?.romGb || currentProduct.rom || 256,
      });
    }
  }, [
    currentProduct,
    currentVariant.color,
    currentVariant.rom,
    setCurrentVariant,
  ]);

  // Unique colors từ variants
  const colors = useMemo(() => {
    if (!currentProduct) return [];
    const list =
      currentProduct.variants?.map((v) => v.color).filter(Boolean) || [];
    if (!list.length && currentProduct.color) return [currentProduct.color];
    return [...new Set(list)];
  }, [currentProduct]);

  // Unique ROMs từ variants
  const roms = useMemo(() => {
    if (!currentProduct) return [];
    const list =
      currentProduct.variants?.map((v) => v.romGb).filter(Boolean) || [];
    if (!list.length && currentProduct.rom) return [currentProduct.rom];
    return [...new Set(list)];
  }, [currentProduct]);

  // Tìm variant theo currentVariant (color + rom)
  const selectedVariant = useMemo(() => {
    if (!currentProduct || !currentProduct.variants?.length) return null;

    const byMatch = currentProduct.variants.find(
      (v) =>
        (currentVariant.color ? v.color === currentVariant.color : true) &&
        (currentVariant.rom ? v.romGb === currentVariant.rom : true),
    );

    return byMatch || currentProduct.variants[0];
  }, [currentProduct, currentVariant]);

  // Nếu chưa có product → render placeholder / null (sau khi đã gọi đủ hooks)
  if (!currentProduct) {
    return (
      <section id="page-product">
        <div className="pd-layout mt-3">
          <div className="card">Đang tải sản phẩm...</div>
        </div>
      </section>
    );
  }

  const productId = currentProduct._id ?? currentProduct.id;
  const brandName = currentProduct.brand?.name ?? currentProduct.brand ?? '';

  const productImage =
    currentProduct.images?.[0]?.url ?? currentProduct.img ?? '';

  const displayPrice =
    selectedVariant?.price ??
    currentProduct.basePrice ??
    currentProduct.price ??
    0;

  const ramGb =
    selectedVariant?.ramGb ??
    currentProduct.ram ??
    null;
  const romGb =
    selectedVariant?.romGb ??
    currentProduct.rom ??
    null;

  const conditionText =
    currentProduct.condition === 'new' ? 'Máy mới' : 'Like new 99%';

  const ratingValue = Number(
    currentProduct.ratingAvg ?? currentProduct.rating ?? 0,
  );
  const ratingCount =
    currentProduct.ratingCount ?? currentProduct.reviews ?? 0;
  const ratingText = `${ratingValue || 0} · ${ratingCount} đánh giá`;

  // Tạo payload chuẩn cho giỏ hàng
  const buildCartPayload = () => {
    const variant = selectedVariant || currentProduct.variants?.[0] || null;

    return {
      productId,
      variantId: variant?._id || null,
      name: currentProduct.name,
      color:
        variant?.color ||
        currentVariant.color ||
        currentProduct.color ||
        'Mặc định',
      ramGb: variant?.ramGb || ramGb || null,
      romGb: variant?.romGb || romGb || null,
      price: displayPrice,
      img: productImage,
    };
  };

  const handleAddToCart = () => {
    if (!onAddToCart) return;
    onAddToCart(buildCartPayload());
  };

  const handleBuyNow = () => {
    if (!onBuyNow) return;
    onBuyNow(buildCartPayload());
  };

  return (
    <section id="page-product">
      <button className="btn-secondary" onClick={() => setPage('category')}>
        ← Quay lại danh sách
      </button>
      <div className="pd-layout mt-3">
        <div className="card">
          <div className="pd-gallery-main">
            <img id="pdMainImg" src={productImage} alt={currentProduct.name} />
          </div>
        </div>
        <div className="card">
          <div className="pd-title">{currentProduct.name}</div>
          <div className="pd-meta">
            {brandName && `${brandName} · `}{' '}
            {ramGb && `${ramGb}GB RAM · `}{romGb && `${romGb}GB ROM · `}
            {conditionText}
          </div>
          <div className="pd-price-row">
            <span className="pd-price-main">
              {formatPrice(displayPrice)}
            </span>
            {currentProduct.oldPrice && (
              <span className="pd-price-old">
                {formatPrice(currentProduct.oldPrice)}
              </span>
            )}
          </div>
          <div className="product-rating">
            ⭐ {ratingText} ·{' '}
            <span className="tag">
              {currentProduct.condition === 'new'
                ? 'Hàng mới chính hãng'
                : 'Máy cũ đẹp như mới'}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-muted">Dung lượng & màu sắc</div>
            <div className="pd-variant-row mt-1">
              {roms.map((r) => (
                <button
                  key={r}
                  className={
                    'pill ' + (currentVariant.rom === r ? 'active' : '')
                  }
                  onClick={() =>
                    setCurrentVariant((v) => ({ ...v, rom: r }))
                  }
                >
                  {r}GB
                </button>
              ))}
            </div>
            <div className="pd-variant-row">
              {colors.map((c) => (
                <button
                  key={c}
                  className={
                    'pill ' + (currentVariant.color === c ? 'active' : '')
                  }
                  onClick={() =>
                    setCurrentVariant((v) => ({ ...v, color: c }))
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-muted">Mô tả</div>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {currentProduct.description}
            </p>
          </div>

          <div className="mt-3">
            <span className="badge-outline">Miễn phí giao hàng nội thành</span>
            <span className="badge-outline">Đổi trả trong 7 ngày</span>
          </div>

          <div className="pd-actions">
            <button className="btn-primary" onClick={handleAddToCart}>
              Thêm vào giỏ
            </button>
            <button className="btn-secondary" onClick={handleBuyNow}>
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
