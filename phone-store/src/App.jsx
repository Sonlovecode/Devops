import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Nav from './components/Nav';
import Home from './components/Home';
import Category from './components/Category';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Profile from './components/Profile';
import Admin from './components/Admin';
import PaymentQR from './components/PaymentQR';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { API_BASE } from './utils/api'; // ✅ dùng API_BASE cho fetch

// ====== STORAGE KEYS (dùng với localStorage) ======
const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  CART: 'cart',
};

// =============== MAIN APP ===============
export default function App() {
  const [page, setPage] = useState('home'); // home | category | product | cart | checkout | profile | admin | paymentqr

  // Giỏ hàng lưu localStorage để F5 không mất
  const [cart, setCart] = useLocalStorageState(STORAGE_KEYS.CART, []);

  // Orders lấy từ backend (cho admin / profile)
  const [orders, setOrders] = useState([]);

  // Order ID cho trang thanh toán QR
  const [orderId, setOrderId] = useState(null);

  // User & token đọc từ localStorage (Profile/Login sẽ set vào đây)
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
  const token =
    localStorage.getItem(STORAGE_KEYS.TOKEN) ||
    localStorage.getItem('token') ||
    null;
  const isAdmin = currentUser?.role === 'admin';

  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    priceMin: '',
    priceMax: '',
    ram: '',
    condition: '',
    sort: 'popularity',
  });

  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentVariant, setCurrentVariant] = useState({
    color: null,
    rom: null,
  });

  const [toastMessage, setToastMessage] = useState('');

  const [checkoutInfo, setCheckoutInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    note: '',
    paymentMethod: 'cod',
    couponCode: '',
  });

  const [adminTab, setAdminTab] = useState('products');

  // ===== Toast auto hide =====
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(''), 2500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const showToast = (msg) => setToastMessage(msg);

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart],
  );

  // ===== QUICK FILTER cho Category (dùng slug brand cho API) =====
  const applyQuickFilter = (type) => {
    let newFilters = { ...filters };

    if (type === 'iphone') newFilters.brand = 'apple'; // brandSlug backend
    if (type === 'gaming') newFilters.ram = '8';
    if (type === 'budget') newFilters.priceMax = '7000000'; // 7 triệu
    if (type === 'camera') {
      // tạm thời dùng khoảng giá
      newFilters.priceMin = '7000000';
    }

    setFilters(newFilters);
    setPage('category');
  };

  // ===== CART =====
  /**
   * addToCart nhận payload dạng:
   * {
   *   productId, variantId,
   *   name, color, ramGb, romGb,
   *   price, img
   * }
   * -> ProductCard / ProductDetail phải truyền dạng này.
   */
  const addToCart = (payloadOrId, qty = 1) => {
    // Trường hợp mới (đúng chuẩn): object payload
    if (typeof payloadOrId === 'object' && payloadOrId !== null) {
      const p = payloadOrId;

      const key = `${p.productId}:${p.variantId || 'default'}`;

      setCart((prev) => {
        const exist = prev.find((i) => i.key === key);
        if (exist) {
          return prev.map((i) =>
            i.key === key ? { ...i, qty: i.qty + qty } : i,
          );
        }
        return [
          ...prev,
          {
            key,
            productId: p.productId,
            variantId: p.variantId || null,
            name: p.name,
            color: p.color || 'Mặc định',
            ramGb: p.ramGb || null,
            romGb: p.romGb || null,
            price: p.price || 0,
            img: p.img || '',
            qty,
          },
        ];
      });

      showToast('Đã thêm vào giỏ hàng');
      return;
    }

    // Trường hợp cũ: chỉ có productId -> không đủ data để tạo order đúng backend
    console.warn(
      'addToCart được gọi với productId thuần. Hãy cập nhật ProductCard/ProductDetail để truyền payload đầy đủ.',
    );
    showToast('Không thể thêm vào giỏ vì thiếu thông tin sản phẩm');
  };

  const buyNow = (payloadOrId) => {
    addToCart(payloadOrId, 1);
    setPage('cart');
  };

  const changeCartQty = (key, delta) => {
    setCart((prev) => {
      const item = prev.find((i) => i.key === key);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prev.filter((i) => i.key !== key);
      }
      return prev.map((i) =>
        i.key === key ? { ...i, qty: newQty } : i,
      );
    });
  };

  const removeCartItem = (key) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  };

  const viewProduct = (id) => {
    setCurrentProductId(id);
    setCurrentVariant({ color: null, rom: null });
    setPage('product');
  };

  // ===== CHECKOUT: tính tạm trên FE (backend sẽ tính lại subtotal/discount/total) =====
  const checkoutCalc = useMemo(() => {
    let subTotal = 0;
    cart.forEach((item) => {
      subTotal += (item.price || 0) * item.qty;
    });
    const shipping = cart.length ? 30000 : 0;
    const discount = 0; // không tự áp dụng giảm giá trên FE
    const total = subTotal + shipping - discount;
    return { subTotal, shipping, discount, total };
  }, [cart]);

  const applyCoupon = () => {
    if (!checkoutInfo.couponCode.trim()) {
      showToast('Vui lòng nhập mã giảm giá');
      return;
    }
    showToast(
      `Mã ${checkoutInfo.couponCode.trim().toUpperCase()} sẽ được kiểm tra khi đặt hàng`,
    );
  };

  const placeOrder = () => {
    const { name, phone, address, city, note, paymentMethod, couponCode } =
      checkoutInfo;

    if (!cart.length) {
      showToast('Giỏ hàng trống');
      return;
    }
    if (!name || !phone || !address || !city) {
      showToast('Vui lòng điền đủ thông tin giao hàng');
      return;
    }

    const payload = {
      fullName: name,
      phone,
      address,
      city,
      note,
      paymentMethod,
      couponCode: couponCode || null,
      items: cart.map((c) => ({
        productId: c.productId,
        variantId: c.variantId,
        quantity: c.qty,
      })),
    };

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // ✅ dùng API_BASE + /api/orders (port 5000)
    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || 'Đặt hàng thất bại');
        }

        // Thành công
        setCart([]);
        setOrderId(data._id);
        setCheckoutInfo({
          name: '',
          phone: '',
          address: '',
          city: '',
          note: '',
          paymentMethod: 'cod',
          couponCode: '',
        });
        showToast('Đặt hàng thành công! Chuyển sang trang thanh toán...');
        setPage('paymentqr');
      })
      .catch((err) => {
        console.error('Order error:', err);
        showToast('Lỗi: ' + err.message);
      });
  };

  // ===== ADMIN: load orders từ backend khi vào trang admin =====
  useEffect(() => {
    if (!isAdmin || page !== 'admin') return;
    if (!token) {
      return;
    }

    // ✅ dùng API_BASE + /api/orders
    fetch(`${API_BASE}/api/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => []);
        if (!res.ok)
          throw new Error(data.message || 'Không load được đơn hàng');
        setOrders(data);
      })
      .catch((err) => {
        console.error('Load orders error:', err);
        showToast('Lỗi: ' + err.message);
      });
  }, [isAdmin, page, token]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total || 0), 0),
    [orders],
  );

  // =============== JSX ===============
  return (
    <>
      <Header
        setPage={setPage}
        cartItemCount={cartItemCount}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <Nav page={page} setPage={setPage} />

      <main>
        <div className="container">
          {page === 'home' && (
            <Home
              setPage={setPage}
              applyQuickFilter={applyQuickFilter}
              onViewProduct={viewProduct}
              onAddToCart={addToCart}
            />
          )}

          {page === 'category' && (
            <Category
              filters={filters}
              setFilters={setFilters}
              searchText={searchText}
              onViewProduct={viewProduct}
              onAddToCart={addToCart}
            />
          )}

          {page === 'product' && (
            <ProductDetail
              currentProductId={currentProductId}
              currentVariant={currentVariant}
              setCurrentVariant={setCurrentVariant}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              setPage={setPage}
            />
          )}

          {page === 'cart' && (
            <Cart
              cart={cart}
              cartItemCount={cartItemCount}
              checkoutCalc={checkoutCalc}
              onChangeCartQty={changeCartQty}
              onRemoveCartItem={removeCartItem}
              setPage={setPage}
            />
          )}

          {page === 'checkout' && (
            <Checkout
              checkoutInfo={checkoutInfo}
              setCheckoutInfo={setCheckoutInfo}
              checkoutCalc={checkoutCalc}
              onApplyCoupon={applyCoupon}
              onPlaceOrder={placeOrder}
            />
          )}

          {page === 'profile' && <Profile />}

          {page === 'paymentqr' && (
            <PaymentQR orderId={orderId} setPage={setPage} />
          )}

          {page === 'admin' && (
            <Admin
              adminTab={adminTab}
              setAdminTab={setAdminTab}
              orders={orders}
              totalRevenue={totalRevenue}
              setPage={setPage}
            />
          )}
        </div>
      </main>

      <Footer />
      <Toast message={toastMessage} />
    </>
  );
}
