export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <h4 style={{ marginBottom: 6 }}>PhoneStore</h4>
          <p className="text-muted">
            Website demo bán điện thoại với đầy đủ luồng: xem sản phẩm, giỏ hàng, thanh toán,
            quản lý đơn và admin.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: 6 }}>Liên hệ</h4>
          <p className="text-muted">Hotline: 1900 1234</p>
          <p className="text-muted">Email: support@phonestore.vn</p>
        </div>
        <div>
          <h4 style={{ marginBottom: 6 }}>Nhận tin khuyến mãi</h4>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 999,
              border: 'none',
              marginBottom: 6,
            }}
          />
          <button className="btn-primary" style={{ width: '100%' }}>
            Đăng ký
          </button>
        </div>
      </div>
    </footer>
  );
}
