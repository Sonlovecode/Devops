import { formatPrice } from '../utils/helpers';

export default function Cart({
  cart,
  cartItemCount,
  checkoutCalc,
  onChangeCartQty,
  onRemoveCartItem,
  setPage,
}) {
  return (
    <section id="page-cart">
      <div className="section-title">
        <span>Giỏ hàng của bạn</span>
        <small>
          {cart.length
            ? `${cart.length} dòng sản phẩm (${cartItemCount} chiếc)`
            : ''}
        </small>
      </div>
      <div id="cartList" className="cart-list">
        {cart.length === 0 && (
          <p className="text-muted">
            Giỏ hàng của bạn đang trống. Hãy thêm vài sản phẩm nhé!
          </p>
        )}
        {cart.map((item) => (
          <div key={item.key} className="cart-item">
            <div>
              <img
                src={item.img}
                alt={item.name}
                style={{ borderRadius: 10 }}
              />
            </div>
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <div className="cart-item-meta">
                {item.color} · {item.rom}GB
              </div>
              <div>{formatPrice(item.price)}</div>
            </div>
            <div className="cart-item-actions">
              <div className="qty-btns">
                <button onClick={() => onChangeCartQty(item.key, -1)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => onChangeCartQty(item.key, 1)}>+</button>
              </div>
              <div className="mt-2">
                <button
                  style={{ background: 'none', color: '#ef4444', fontSize: 11 }}
                  onClick={() => onRemoveCartItem(item.key)}
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div id="cartSummary" className="cart-summary">
          <div className="cart-summary-row">
            <span>Tạm tính</span>
            <span>{formatPrice(checkoutCalc.subTotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Phí vận chuyển</span>
            <span>{formatPrice(checkoutCalc.shipping)}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Thành tiền</span>
            <span>{formatPrice(checkoutCalc.subTotal + checkoutCalc.shipping)}</span>
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 10 }}
            onClick={() => setPage('checkout')}
          >
            Tiến hành thanh toán
          </button>
        </div>
      )}
    </section>
  );
}
