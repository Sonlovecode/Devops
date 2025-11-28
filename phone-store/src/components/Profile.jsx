import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/api';
import { STORAGE_KEYS } from '../constants/storage';
import { formatPrice } from '../utils/helpers';

export default function Profile() {
  // Lấy user + token từ localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USER) || 'null',
      );
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.TOKEN) ||
      localStorage.getItem('token') ||
      null
    );
  });

  // authMode: login | register
  const [authMode, setAuthMode] = useState('login');

  // Form login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Form register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Orders
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // ====== Helpers lưu/clear auth ======
  const saveAuth = (user, tokenValue) => {
    setCurrentUser(user);
    setToken(tokenValue);

    // Lưu theo STORAGE_KEYS
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, tokenValue);

    // Backward compat: 'user', 'token'
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', tokenValue);
  };

  const clearAuth = () => {
    setCurrentUser(null);
    setToken(null);
    // Xoá các key
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // ====== Login ======
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setRegSuccess('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setLoginLoading(true);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      if (!data.token || !data.user) {
        throw new Error('Phản hồi đăng nhập không hợp lệ');
      }

      saveAuth(data.user, data.token);

      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoginLoading(false);
    }
  };

  // ====== Register ======
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setLoginError('');

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setRegError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setRegLoading(true);

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      setRegSuccess('Đăng ký thành công, hãy đăng nhập để tiếp tục.');
      setRegError('');

      // clear form
      setRegPassword('');
      // auto chuyển sang tab login (tuỳ m, hiện tao chỉ hiển thị message)
      setAuthMode('login');
      setLoginEmail(regEmail);
    } catch (err) {
      console.error('Register error:', err);
      setRegError(err.message || 'Đăng ký thất bại');
    } finally {
      setRegLoading(false);
    }
  };

  // ====== Fetch lịch sử đơn hàng ======
  useEffect(() => {
    if (!token) {
      setMyOrders([]);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await fetch(`${API_BASE}/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setMyOrders(data);
        } else {
          setMyOrders([]);
        }
      } catch (err) {
        console.error('GET /orders/my error:', err);
        setMyOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [token]);

  // ====== UI: Chưa đăng nhập → show login/register ======
  if (!currentUser || !token) {
    return (
      <section id="page-profile">
        <div className="auth-layout">
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={
                  'auth-tab ' + (authMode === 'login' ? 'active' : '')
                }
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                  setRegError('');
                  setRegSuccess('');
                }}
              >
                Đăng nhập
              </button>
              <button
                className={
                  'auth-tab ' + (authMode === 'register' ? 'active' : '')
                }
                onClick={() => {
                  setAuthMode('register');
                  setLoginError('');
                  setRegError('');
                  setRegSuccess('');
                }}
              >
                Đăng ký
              </button>
            </div>

            {authMode === 'login' && (
              <form onSubmit={handleLogin}>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Đăng nhập</h3>
                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="form-field">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Mật khẩu"
                  />
                </div>
                {loginError && (
                  <p className="text-error" style={{ marginTop: 6 }}>
                    {loginError}
                  </p>
                )}
                {regSuccess && (
                  <p className="text-success" style={{ marginTop: 6 }}>
                    {regSuccess}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: 10 }}
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>
            )}

            {authMode === 'register' && (
              <form onSubmit={handleRegister}>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Đăng ký</h3>
                <div className="form-field">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="form-field">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                  />
                </div>
                <div className="form-field">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
                {regError && (
                  <p className="text-error" style={{ marginTop: 6 }}>
                    {regError}
                  </p>
                )}
                {regSuccess && (
                  <p className="text-success" style={{ marginTop: 6 }}>
                    {regSuccess}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: 10 }}
                  disabled={regLoading}
                >
                  {regLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ====== UI: ĐÃ đăng nhập ======
  return (
    <section id="page-profile">
      <div className="section-title">
        <span>Tài khoản của tôi</span>
        <small>Xin chào, {currentUser.name || 'Khách hàng'}</small>
      </div>

      <div className="layout-2col">
        {/* Thông tin tài khoản */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Thông tin cá nhân</h3>
          <div className="profile-info">
            <div className="profile-row">
              <span>Họ tên:</span>
              <strong>{currentUser.name || '—'}</strong>
            </div>
            <div className="profile-row">
              <span>Email:</span>
              <strong>{currentUser.email || '—'}</strong>
            </div>
            <div className="profile-row">
              <span>Số điện thoại:</span>
              <strong>{currentUser.phone || '—'}</strong>
            </div>
            <div className="profile-row">
              <span>Quyền:</span>
              <strong>{currentUser.role || 'customer'}</strong>
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ marginTop: 12 }}
            onClick={clearAuth}
          >
            Đăng xuất
          </button>
        </div>

        {/* Lịch sử đơn hàng */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Đơn hàng của bạn</h3>

          {loadingOrders && (
            <p className="text-muted">Đang tải lịch sử đơn hàng...</p>
          )}

          {!loadingOrders && myOrders.length === 0 && (
            <p className="text-muted">
              Bạn chưa có đơn hàng nào. Hãy đặt thử một đơn nhé!
            </p>
          )}

          {!loadingOrders && myOrders.length > 0 && (
            <div className="orders-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((o) => (
                    <tr key={o._id}>
                      <td>{o._id}</td>
                      <td>
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td>{formatPrice(o.total || 0)}</td>
                      <td>{o.paymentMethod || 'N/A'}</td>
                      <td>{o.status || 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
