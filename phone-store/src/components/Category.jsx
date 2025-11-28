import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';

export default function Category({
  filters,
  setFilters,
  onViewProduct,
  onAddToCart,
  searchText,
}) {
  const { products: filteredProducts, loading, error } = useProducts(filters, searchText);

  return (
    <section id="page-category">
      <div className="section-title">
        <span>Danh sách điện thoại</span>
        <small>{filteredProducts?.length || 0} sản phẩm</small>
      </div>
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
      {loading && <p>Đang tải...</p>}
      <div className="layout-2col">
        <aside className="filter-card">
          <div className="filter-group">
            <label>Hãng</label>
            <select
              value={filters.brand}
              onChange={(e) =>
                setFilters((f) => ({ ...f, brand: e.target.value }))
              }
            >
              <option value="">Tất cả</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="Oppo">Oppo</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Mức giá (triệu)</label>
            <div className="filter-inline">
              <input
                type="number"
                placeholder="Từ"
                min="0"
                step="1"
                value={filters.priceMin}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priceMin: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Đến"
                min="0"
                step="1"
                value={filters.priceMax}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priceMax: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="filter-group">
            <label>RAM</label>
            <select
              value={filters.ram}
              onChange={(e) =>
                setFilters((f) => ({ ...f, ram: e.target.value }))
              }
            >
              <option value="">Tất cả</option>
              <option value="6">≥ 6GB</option>
              <option value="8">≥ 8GB</option>
              <option value="12">≥ 12GB</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Trạng thái</label>
            <select
              value={filters.condition}
              onChange={(e) =>
                setFilters((f) => ({ ...f, condition: e.target.value }))
              }
            >
              <option value="">Tất cả</option>
              <option value="new">Máy mới</option>
              <option value="used">Máy cũ (like new)</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sắp xếp</label>
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sort: e.target.value }))
              }
            >
              <option value="popularity">Phổ biến</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="newest">Hàng mới</option>
            </select>
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 8 }}
          >
            Áp dụng bộ lọc
          </button>
          <button
            className="btn-secondary"
            style={{ width: '100%', marginTop: 6 }}
            onClick={() =>
              setFilters({
                brand: '',
                priceMin: '',
                priceMax: '',
                ram: '',
                condition: '',
                sort: 'popularity',
              })
            }
          >
            Xoá lọc
          </button>
        </aside>
        <div>
          <div id="categoryGrid" className="product-grid">
            {!loading && filteredProducts?.map((p) => (
              <ProductCard
                key={p._id || p.id}
                product={p}
                onViewProduct={onViewProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
