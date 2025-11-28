import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/api';

export default function PaymentQR({ orderId, setPage }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!orderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Không tìm thấy đơn hàng');
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/payment/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQrData(data);
        } else {
          setError(data.message || 'Không thể tạo mã QR');
        }
      })
      .catch((err) => {
        console.error('QR error:', err);
        setError('Lỗi tạo mã QR');
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleConfirm = () => {
    setConfirming(true);
    fetch(`${API_BASE}/payment/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert('Đã xác nhận thanh toán! Cảm ơn quý khách.');
          setPage('profile');
        } else {
          alert(data.message || 'Xác nhận thất bại');
        }
      })
      .catch((err) => {
        console.error('Confirm error:', err);
        alert('Lỗi xác nhận thanh toán');
      })
      .finally(() => setConfirming(false));
  };

  return (
    <section id="page-payment-qr" style={{ padding: '40px 20px' }}>
      <div
        style={{
          maxWidth: '500px',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginBottom: '8px' }}>Thanh toán QR MB Bank</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Quét mã QR bằng ứng dụng ngân hàng để thanh toán
        </p>

        {loading ? (
          <p style={{ color: '#999' }}>⏳ Đang tạo mã QR...</p>
        ) : error ? (
          <p style={{ color: '#d32f2f' }}>❌ {error}</p>
        ) : (
          <>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}>
                <strong>Chủ tài khoản:</strong> CAO LÊ SƠN
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}>
                <strong>Ngân hàng:</strong> MB Bank
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}>
                <strong>Số tài khoản:</strong> 0773315677
              </p>
            </div>

            <img
              src={qrData.qrUrl}
              alt="QR thanh toán"
              style={{
                width: '280px',
                height: '280px',
                margin: '20px auto',
                display: 'block',
                borderRadius: '12px',
                border: '2px solid #eee',
              }}
            />

            <div
              style={{
                backgroundColor: '#fff3e0',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                borderLeft: '4px solid #ff9800',
              }}
            >
              <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                <strong>Nội dung chuyển khoản:</strong>
                <br />
                <code
                  style={{
                    backgroundColor: '#fff',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginTop: '8px',
                    fontSize: '12px',
                  }}
                >
                  {qrData.note}
                </code>
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#e3f2fd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
                💰 {qrData.amount.toLocaleString('vi-VN')}₫
              </p>
            </div>

            <button
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                marginBottom: '10px',
                cursor: confirming ? 'not-allowed' : 'pointer',
                opacity: confirming ? 0.7 : 1,
              }}
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? '⏳ Đang xác nhận...' : '✓ Tôi đã thanh toán'}
            </button>

            <button
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
              }}
              onClick={() => setPage('profile')}
            >
              ← Quay lại
            </button>
          </>
        )}
      </div>
    </section>
  );
}
