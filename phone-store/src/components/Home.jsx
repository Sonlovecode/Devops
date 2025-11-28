// src/components/Home.jsx
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../utils/helpers';

export default function Home({
  setPage,
  applyQuickFilter,
  onViewProduct,
  onAddToCart,
}) {
  const { products: allProducts } = useProducts({}, '');

  // Lấy sản phẩm đầu tiên làm hero (nếu có)
  const heroProduct =
    allProducts?.[0] || {
      name: 'iPhone 15 Pro Max',
      price: 27990000,
    };

  // Giá hiển thị ở hero: ưu tiên variant → basePrice → price mock
  const heroPrice =
    heroProduct?.variants?.[0]?.price ??
    heroProduct?.basePrice ??
    heroProduct?.price ??
    0;

  return (
    <section id="page-home">
      <div className="hero">
        <div>
          <div className="hero-badge">
            <span></span> Black Friday · Sale tới 25%
          </div>
          <h1 className="hero-title">
            Nâng cấp chiếc điện thoại tiếp theo của bạn.
          </h1>
          <p className="hero-subtitle">
            Hơn 200+ mẫu điện thoại mới &amp; like new, hỗ trợ trả góp, giao nhanh 2h nội
            thành.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => setPage('category')}>
              Xem deal hot hôm nay
            </button>
            <button
              className="btn-secondary"
              onClick={() =>
                document
                  .getElementById('section-guides')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Xem tư vấn chọn máy
            </button>
          </div>
          <div className="chips mt-3">
            <span className="chip">iPhone 16 Series</span>
            <span className="chip">Galaxy S24</span>
            <span className="chip">Gaming Phone</span>
            <span className="chip">Máy cũ tiết kiệm</span>
          </div>
        </div>

        <div className="hero-phone">
          <img
            src="https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="phone"
          />
          <p className="hero-phone-name">{heroProduct.name}</p>
          <p className="hero-phone-price">{formatPrice(heroPrice)}</p>
          <small className="text-muted">Độc quyền Online · Giao siêu tốc</small>
        </div>
      </div>

      <div className="section-title">
        <span>Deal nổi bật hôm nay</span>
        <small>Chỉ áp dụng online</small>
      </div>
      <div id="homeDeals" className="product-grid">
        {allProducts
          ?.filter((p) => p.isHotDeal)
          .map((p) => (
            <ProductCard
              key={p._id || p.id} // hỗ trợ cả data từ Mongo (_id) lẫn mock (id)
              product={p}
              onViewProduct={onViewProduct}
              onAddToCart={onAddToCart}
            />
          ))}
      </div>

      <div className="section-title" id="section-guides">
        <span>Gợi ý theo nhu cầu</span>
        <small>Chọn nhanh mà không cần rối</small>
      </div>
      <div className="chips">
        <span className="chip" onClick={() => applyQuickFilter('iphone')}>
          iPhone cho mọi nhu cầu
        </span>
        <span className="chip" onClick={() => applyQuickFilter('gaming')}>
          Máy mạnh chơi game
        </span>
        <span className="chip" onClick={() => applyQuickFilter('budget')}>
          Máy dưới 7 triệu
        </span>
        <span className="chip" onClick={() => applyQuickFilter('camera')}>
          Chụp ảnh đẹp
        </span>
      </div>
      <div className="section-title">
        <span>Điện thoại mới &amp; Like New</span>
        <small>Hàng chính hãng, bảo hành đầy đủ</small>
      </div>
      <div className="product-grid">
        {allProducts
          ?.filter((p) => p.condition === 'new' || p.condition === 'used')
          .map((p) => (
            <ProductCard
              key={p._id || p.id} // hỗ trợ cả data từ Mongo (_id) lẫn mock (id)
              product={p}
              onViewProduct={onViewProduct}
              onAddToCart={onAddToCart}
            />
          ))}
      </div>
    </section>
  );
}
