export default function Nav({ page, setPage }) {
  return (
    <nav>
      <div className="nav-inner">
        <button
          className={`nav-link ${page === 'home' ? 'active' : ''}`}
          onClick={() => setPage('home')}
        >
          Trang chủ
        </button>
        <button
          className={`nav-link ${page === 'category' ? 'active' : ''}`}
          onClick={() => setPage('category')}
        >
          Điện thoại
        </button>
        <button
          className={`nav-link ${page === 'cart' ? 'active' : ''}`}
          onClick={() => setPage('cart')}
        >
          Giỏ hàng
        </button>
        <button
          className={`nav-link ${page === 'profile' ? 'active' : ''}`}
          onClick={() => setPage('profile')}
        >
          Tài khoản
        </button>
        <button
          className={`nav-link ${page === 'admin' ? 'active' : ''}`}
          onClick={() => setPage('admin')}
        >
          Admin
        </button>
      </div>
    </nav>
  );
}
