import { formatPrice } from '../utils/helpers';

export default function Checkout({
  checkoutInfo,
  setCheckoutInfo,
  checkoutCalc,
  onApplyCoupon,
  onPlaceOrder,
}) {
  return (
    <section id="page-checkout">
      <div className="section-title">
        <span>Thanh toán</span>
        <small>Hoàn tất đơn hàng trong 1 phút</small>
      </div>
      <div className="layout-2col">
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Thông tin giao hàng</h3>
          <div className="form-grid form-grid-cols2">
            <div className="form-field">
              <label>Họ và tên</label>
              <input
                type="text"
                value={checkoutInfo.name}
                onChange={(e) =>
                  setCheckoutInfo((info) => ({
                    ...info,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-field">
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={checkoutInfo.phone}
                onChange={(e) =>
                  setCheckoutInfo((info) => ({
                    ...info,
                    phone: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-field">
              <label>Địa chỉ</label>
              <input
                type="text"
                value={checkoutInfo.address}
                onChange={(e) =>
                  setCheckoutInfo((info) => ({
                    ...info,
                    address: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-field">
              <label>Tỉnh/Thành phố</label>
              <input
                type="text"
                value={checkoutInfo.city}
                onChange={(e) =>
                  setCheckoutInfo((info) => ({
                    ...info,
                    city: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-field">
              <label>Ghi chú</label>
              <textarea
                rows={3}
                value={checkoutInfo.note}
                onChange={(e) =>
                  setCheckoutInfo((info) => ({
                    ...info,
                    note: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Tóm tắt đơn hàng</h3>
          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(checkoutCalc.subTotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Phí vận chuyển</span>
              <span>{formatPrice(checkoutCalc.shipping)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Giảm giá</span>
              <span>-{formatPrice(checkoutCalc.discount)}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Cần thanh toán</span>
              <span>{formatPrice(checkoutCalc.total)}</span>
            </div>
          </div>
          <div className="form-field mt-3">
            <label>Mã giảm giá</label>
            <div className="filter-inline">
              <input
                type="text"
                placeholder="Nhập mã (VD: WELCOME10)"
                value={checkoutInfo.couponCode}
                onChange={(e) =>
                  setCheckoutInfo((info) => ({
                    ...info,
                    couponCode: e.target.value,
                  }))
                }
              />
              <button className="btn-secondary" onClick={onApplyCoupon}>
                Áp dụng
              </button>
            </div>
          </div>
          <div className="form-field mt-3">
            <label>Phương thức thanh toán</label>
            <select
              value={checkoutInfo.paymentMethod}
              onChange={(e) =>
                setCheckoutInfo((info) => ({
                  ...info,
                  paymentMethod: e.target.value,
                }))
              }
            >
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="bank">Chuyển khoản ngân hàng</option>
              <option value="vnpay">VNPay (demo)</option>
            </select>
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 12 }}
            onClick={onPlaceOrder}
          >
            Đặt hàng
          </button>
        </div>
      </div>
    </section>
  );
}
