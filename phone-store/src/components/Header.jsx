export default function Header({ setPage, currentUser, cartItemCount, searchText, setSearchText }) {
  return (
    <header>
      <div className="header-inner">
        <div className="logo" onClick={() => setPage('home')}>
          PhoneStore
        </div>
        <div className="search-bar">
          <span className="search-bar-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm điện thoại theo tên, hãng, chip..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && setPage('category')}
          />
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setPage('cart')}>
            🛒 <span>Giỏ hàng</span>
            <span id="cartCountBadge" className="badge">
              {cartItemCount}
            </span>
          </button>
          <button className="icon-btn" onClick={() => setPage('profile')}>
            👤 <span>{currentUser ? currentUser.name : 'Đăng nhập'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
