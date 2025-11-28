import { useState, useEffect } from 'react';
import { formatPrice } from '../utils/helpers';
import { STORAGE_KEYS } from '../constants/storage';
import { API_BASE } from '../utils/api';

const ORDER_STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Returned',
];

const EMPTY_PRODUCT_FORM = {
  name: '',
  brandSlug: '',
  basePrice: '',
  price: '',
  condition: 'new',
  color: '',
  ramGb: '',
  romGb: '',
  stockQty: '',
  imageUrl: '',
  description: '',
};

export default function Admin({
  adminTab,
  setAdminTab,
  orders,
  totalRevenue,
  setPage,
}) {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [editingProductId, setEditingProductId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Đơn hàng local để sửa trạng thái trong UI
  const [ordersLocal, setOrdersLocal] = useState(orders || []);
  const [orderStatusDraft, setOrderStatusDraft] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Sync orders props -> local khi thay đổi
  useEffect(() => {
    setOrdersLocal(orders || []);
  }, [orders]);

  // User + token
  const currentUser = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.USER) || 'null',
  );
  const token =
    localStorage.getItem(STORAGE_KEYS.TOKEN) ||
    localStorage.getItem('token') ||
    null;
  const isAdmin = currentUser?.role === 'admin';

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    : { 'Content-Type': 'application/json' };

  // ===== FETCH PRODUCTS =====
  const fetchProducts = async () => {
    if (!isAdmin) return;
    try {
      setIsLoadingProducts(true);
      const res = await fetch(`${API_BASE}/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // ===== FETCH USERS =====
  const fetchUsers = async () => {
    if (!isAdmin || !token) return;
    try {
      setLoadingUsers(true);
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('GET /api/users error:', err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ===== UPDATE USER =====
  const updateUser = async (userId, patch) => {
    if (!userId) return;
    try {
      setUpdatingUserId(userId);
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể cập nhật user');
      }

      // cập nhật lại trong state
      setUsers((prev) => prev.map((u) => (u._id === userId ? data : u)));
    } catch (err) {
      console.error('Update user error:', err);
      alert(err.message || 'Lỗi cập nhật user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, token]);

  // ========== GUARD: NOT ADMIN ==========
  if (!isAdmin) {
    return (
      <section id="page-admin">
        <div className="auth-card">
          <h3 style={{ marginBottom: 8 }}>Khu vực quản trị</h3>
          <p className="text-muted">
            Bạn cần đăng nhập bằng tài khoản admin để truy cập trang này.
          </p>
          <button
            className="btn-primary"
            style={{ marginTop: 10 }}
            onClick={() => setPage('profile')}
          >
            Đăng nhập với tài khoản admin
          </button>
        </div>
      </section>
    );
  }

  // ===== HANDLERS: PRODUCT FORM =====
  const handleProductFormChange = (field, value) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditProduct = (p) => {
    const firstVariant = p.variants?.[0] || {};
    setEditingProductId(p._id || p.id);
    setProductForm({
      name: p.name || '',
      brandSlug: p.brand?.slug || p.brand?.name || p.brand || '',
      basePrice: p.basePrice ?? p.price ?? '',
      price: firstVariant.price ?? p.basePrice ?? p.price ?? '',
      condition: p.condition || 'new',
      color: firstVariant.color || '',
      ramGb: firstVariant.ramGb ?? '',
      romGb: firstVariant.romGb ?? '',
      stockQty: firstVariant.stockQty ?? '',
      imageUrl: p.images?.[0]?.url || '',
      description: p.description || '',
    });
    setAdminTab('products');
  };

  const resetProductForm = () => {
    setProductForm(EMPTY_PRODUCT_FORM);
    setEditingProductId(null);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.brandSlug || !productForm.basePrice) {
      alert('Vui lòng nhập ít nhất tên, hãng và giá cơ bản');
      return;
    }

    const basePriceNum = Number(productForm.basePrice) || 0;
    const priceNum = Number(productForm.price) || basePriceNum;

    const payload = {
      name: productForm.name,
      brandSlug: productForm.brandSlug,
      basePrice: basePriceNum,
      oldPrice: null,
      condition: productForm.condition || 'new',
      description: productForm.description || '',
      images: productForm.imageUrl ? [productForm.imageUrl] : [],
      variants: [
        {
          color: productForm.color || undefined,
          ramGb: productForm.ramGb ? Number(productForm.ramGb) : undefined,
          romGb: productForm.romGb ? Number(productForm.romGb) : undefined,
          price: priceNum,
          stockQty: productForm.stockQty
            ? Number(productForm.stockQty)
            : 0,
          isDefault: true,
        },
      ],
    };

    try {
      setSavingProduct(true);

      if (editingProductId) {
        // UPDATE
        const res = await fetch(
          `${API_BASE}/products/${editingProductId}`,
          {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Cập nhật sản phẩm thất bại');
        }
        alert('Đã cập nhật sản phẩm');
      } else {
        // CREATE
        const res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Thêm sản phẩm thất bại');
        }
        alert('Đã thêm sản phẩm mới');
      }

      resetProductForm();
      fetchProducts();
    } catch (err) {
      console.error('Save product error:', err);
      alert('Lỗi: ' + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) return;

    try {
      setDeletingProductId(id);
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Xoá sản phẩm thất bại');
      }
      alert('Đã xoá sản phẩm');
      fetchProducts();
    } catch (err) {
      console.error('Delete product error:', err);
      alert('Lỗi: ' + err.message);
    } finally {
      setDeletingProductId(null);
    }
  };

  // ===== HANDLERS: ORDER STATUS =====
  const handleChangeOrderStatusDraft = (orderId, value) => {
    setOrderStatusDraft((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const handleUpdateOrderStatus = async (orderId) => {
    const newStatus =
      orderStatusDraft[orderId] ||
      ordersLocal.find((o) => o._id === orderId)?.status ||
      'Pending';

    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(
        `${API_BASE}/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Cập nhật trạng thái đơn thất bại');
      }

      // cập nhật local list
      setOrdersLocal((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o,
        ),
      );
      alert('Đã cập nhật trạng thái đơn hàng');
    } catch (err) {
      console.error('Update order status error:', err);
      alert('Lỗi: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totalRevenueLocal = (ordersLocal || []).reduce(
    (sum, o) => sum + (o.total || 0),
    0,
  );

  // ================== RENDER ==================
  return (
    <section id="page-admin">
      <div className="section-title">
        <span>Admin Dashboard</span>
        <small>Xin chào, {currentUser?.name || 'Admin'}</small>
      </div>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div
            className={
              'admin-menu-item ' + (adminTab === 'products' ? 'active' : '')
            }
            onClick={() => setAdminTab('products')}
          >
            Sản phẩm
          </div>
          <div
            className={
              'admin-menu-item ' + (adminTab === 'orders' ? 'active' : '')
            }
            onClick={() => setAdminTab('orders')}
          >
            Đơn hàng
          </div>
          <div
            className={
              'admin-menu-item ' + (adminTab === 'users' ? 'active' : '')
            }
            onClick={() => setAdminTab('users')}
          >
            Người dùng
          </div>
          <div
            className={
              'admin-menu-item ' + (adminTab === 'reports' ? 'active' : '')
            }
            onClick={() => setAdminTab('reports')}
          >
            Báo cáo
          </div>
        </aside>

        <div className="admin-main">
          {/* ===== TAB: PRODUCTS ===== */}
          {adminTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 style={{ fontSize: 15 }}>
                  Quản lý sản phẩm ({products.length})
                </h3>
              </div>

              {/* Form thêm / sửa */}
              <div className="card mb-3">
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>
                  {editingProductId
                    ? 'Sửa sản phẩm'
                    : 'Thêm sản phẩm mới (đơn giản)'}
                </h4>
                <form onSubmit={handleSubmitProduct} className="form-grid form-grid-cols2">
                  <div className="form-field">
                    <label>Tên sản phẩm</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) =>
                        handleProductFormChange('name', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>Hãng (slug / name)</label>
                    <input
                      type="text"
                      value={productForm.brandSlug}
                      onChange={(e) =>
                        handleProductFormChange('brandSlug', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>Giá cơ bản (basePrice)</label>
                    <input
                      type="number"
                      value={productForm.basePrice}
                      onChange={(e) =>
                        handleProductFormChange('basePrice', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>Giá variant (nếu khác)</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        handleProductFormChange('price', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>Loại máy</label>
                    <select
                      value={productForm.condition}
                      onChange={(e) =>
                        handleProductFormChange('condition', e.target.value)
                      }
                    >
                      <option value="new">Máy mới</option>
                      <option value="used">Máy cũ</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Màu</label>
                    <input
                      type="text"
                      value={productForm.color}
                      onChange={(e) =>
                        handleProductFormChange('color', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>RAM (GB)</label>
                    <input
                      type="number"
                      value={productForm.ramGb}
                      onChange={(e) =>
                        handleProductFormChange('ramGb', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>ROM (GB)</label>
                    <input
                      type="number"
                      value={productForm.romGb}
                      onChange={(e) =>
                        handleProductFormChange('romGb', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>Tồn kho</label>
                    <input
                      type="number"
                      value={productForm.stockQty}
                      onChange={(e) =>
                        handleProductFormChange('stockQty', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>Ảnh (URL)</label>
                    <input
                      type="text"
                      value={productForm.imageUrl}
                      onChange={(e) =>
                        handleProductFormChange('imageUrl', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field form-field-full">
                    <label>Mô tả</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) =>
                        handleProductFormChange('description', e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field form-field-full flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={savingProduct}
                    >
                      {savingProduct
                        ? 'Đang lưu...'
                        : editingProductId
                        ? 'Lưu thay đổi'
                        : 'Thêm sản phẩm'}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={resetProductForm}
                      >
                        Huỷ sửa
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Bảng sản phẩm */}
              {isLoadingProducts ? (
                <p className="text-muted">Đang tải sản phẩm...</p>
              ) : products.length === 0 ? (
                <p className="text-muted">Không có sản phẩm nào.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Tên</th>
                      <th>Hãng</th>
                      <th>Giá</th>
                      <th>Loại</th>
                      <th style={{ width: 140 }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const displayPrice = p.basePrice ?? p.price ?? 0;
                      const brandName = p.brand?.name ?? p.brand ?? '';
                      return (
                        <tr key={p._id || p.id}>
                          <td>{p._id || p.id}</td>
                          <td>{p.name}</td>
                          <td>{brandName}</td>
                          <td>{formatPrice(displayPrice)}</td>
                          <td>{p.condition === 'new' ? 'Mới' : 'Cũ'}</td>
                          <td>
                            <button
                              className="btn-xs"
                              onClick={() => handleEditProduct(p)}
                            >
                              Sửa
                            </button>{' '}
                            <button
                              className="btn-xs btn-danger"
                              disabled={deletingProductId === (p._id || p.id)}
                              onClick={() =>
                                handleDeleteProduct(p._id || p.id)
                              }
                            >
                              {deletingProductId === (p._id || p.id)
                                ? 'Đang xoá...'
                                : 'Xoá'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ===== TAB: ORDERS ===== */}
          {adminTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: 15 }}>
                Quản lý đơn hàng ({ordersLocal.length})
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersLocal.length === 0 && (
                    <tr>
                      <td colSpan={7}>Chưa có đơn hàng nào.</td>
                    </tr>
                  )}
                  {ordersLocal.map((o) => {
                    const currentStatus =
                      orderStatusDraft[o._id] || o.status || 'Pending';
                    return (
                      <tr key={o._id}>
                        <td>{o._id}</td>
                        <td>
                          {o.fullName || o.customer?.name || 'N/A'}
                          {o.phone ? ` · ${o.phone}` : ''}
                        </td>
                        <td>{formatPrice(o.total || 0)}</td>
                        <td>{o.paymentMethod || 'N/A'}</td>
                        <td>
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              handleChangeOrderStatusDraft(
                                o._id,
                                e.target.value,
                              )
                            }
                          >
                            {ORDER_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleString('vi-VN')
                            : 'N/A'}
                        </td>
                        <td>
                          <button
                            className="btn-xs"
                            disabled={updatingOrderId === o._id}
                            onClick={() => handleUpdateOrderStatus(o._id)}
                          >
                            {updatingOrderId === o._id
                              ? 'Đang lưu...'
                              : 'Cập nhật'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== TAB: USERS (placeholder) ===== */}
          {adminTab === 'users' && (
            <div>
              <h3 style={{ fontSize: 15 }}>Quản lý người dùng ({users.length})</h3>

              {loadingUsers ? (
                <p className="text-muted mt-2">Đang tải danh sách người dùng…</p>
              ) : users.length === 0 ? (
                <p className="text-muted mt-2">Chưa có người dùng nào.</p>
              ) : (
                <table className="admin-table mt-2">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Điện thoại</th>
                      <th>Quyền</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u._id}</td>
                        <td>{u.name || '—'}</td>
                        <td>{u.email || '—'}</td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          <select
                            value={u.role || 'customer'}
                            onChange={(e) =>
                              updateUser(u._id, { role: e.target.value })
                            }
                            disabled={updatingUserId === u._id}
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={u.status || 'active'}
                            onChange={(e) =>
                              updateUser(u._id, { status: e.target.value })
                            }
                            disabled={updatingUserId === u._id}
                          >
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                          </select>
                        </td>
                        <td>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleString('vi-VN')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ===== TAB: REPORTS ===== */}
          {adminTab === 'reports' && (
            <div>
              <h3 style={{ fontSize: 15 }}>Báo cáo tổng quan</h3>
              <div className="mt-3">
                <div className="cart-summary-row">
                  <span>Tổng doanh thu (theo đơn)</span>
                  <span>{formatPrice(totalRevenueLocal || totalRevenue)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Số đơn hàng</span>
                  <span>{ordersLocal.length}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Số lượng sản phẩm trong catalog</span>
                  <span>{products.length}</span>
                </div>
              </div>
              <p className="text-muted mt-3">
                Số liệu đang lấy trực tiếp từ API backend (orders & products).
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
