import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<any>(null);
  const [view, setView] = useState<'selection' | 'upi' | 'card' | 'processing' | 'success' | 'error'>('selection');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // NEW: State to store the payment ID immediately after initiation
  const [activePaymentId, setActivePaymentId] = useState<string>('');

  // 1. Fetch order details on load via public route
  useEffect(() => {
    if (orderId) {
      axios.get(`http://localhost:8000/api/v1/orders/${orderId}/public`)
        .then(res => setOrder(res.data))
        .catch(() => setErrorMessage("Order not found"));
    }
  }, [orderId]);

  // 2. Submit payment and capture the ID
  const handlePayment = async (method: 'upi' | 'card', details: any) => {
    setView('processing');
    try {
      const response = await axios.post('http://localhost:8000/api/v1/payments/public', {
        order_id: orderId,
        method,
        ...details
      });
      
      // Capture the ID from the 201 response
      const paymentId = response.data.id;
      setActivePaymentId(paymentId); 
      
      pollPaymentStatus(paymentId);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.description || "Payment initiation failed");
      setView('error');
    }
  };

  // 3. Polling logic calling the PUBLIC status endpoint
  const pollPaymentStatus = (paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/payments/${paymentId}/status`);
        console.log("Current status:", res.data.status);

        if (res.data.status === 'success') {
          setPaymentResult(res.data);
          setView('success');
          clearInterval(interval);
        } else if (res.data.status === 'failed') {
          setErrorMessage("Payment failed");
          setView('error');
          clearInterval(interval);
        }
      } catch (err) { 
        console.error("Polling error:", err);
      }
    }, 2000);
  };

  if (!order && !errorMessage) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div data-test-id="checkout-container" className="max-w-md mx-auto p-6 bg-white shadow-xl rounded-2xl mt-12 border border-gray-100">
      
      {/* Order Summary */}
      <div data-test-id="order-summary" className="mb-6 bg-gray-50 p-4 rounded-lg space-y-2">
        <h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2">Order Summary</h2>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Order ID:</span>
          <span data-test-id="order-id" className="font-mono text-gray-700">{orderId}</span>
        </div>
        
        {/* NEW: Display Payment ID if it has been generated */}
        {activePaymentId && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment ID:</span>
            <span className="font-mono text-indigo-600 font-bold">{activePaymentId}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Amount:</span>
          <span data-test-id="order-amount" className="text-xl font-black text-indigo-600">₹{(order?.amount / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Selection View */}
      {view === 'selection' && (
        <div data-test-id="payment-methods" className="space-y-3">
          <button data-test-id="method-upi" onClick={() => setView('upi')} className="w-full py-4 bg-white border-2 border-gray-100 rounded-xl font-bold">UPI</button>
          <button data-test-id="method-card" onClick={() => setView('card')} className="w-full py-4 bg-white border-2 border-gray-100 rounded-xl font-bold">Card</button>
        </div>
      )}

      {/* Forms */}
      {view === 'upi' && (
        <form data-test-id="upi-form" onSubmit={(e:any) => { e.preventDefault(); handlePayment('upi', { upi_info: { vpa: e.target.vpa.value } }); }}>
          <input data-test-id="vpa-input" name="vpa" placeholder="user@bank" className="w-full p-4 border rounded-xl mb-4" required />
          <button data-test-id="pay-button" type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">Pay Now</button>
        </form>
      )}

      {view === 'card' && (
        <form data-test-id="card-form" onSubmit={(e:any) => { e.preventDefault(); handlePayment('card', { card_info: { number: e.target.num.value } }); }}>
          <input data-test-id="card-number-input" name="num" placeholder="Card Number" className="w-full p-4 border rounded-xl mb-3" required />
          <div className="flex gap-2 mb-4">
            <input data-test-id="expiry-input" name="exp_month" placeholder="MM" className="w-1/2 p-4 border rounded-xl" required />
            <input data-test-id="cvv-input" name="cvv" placeholder="CVV" className="w-1/2 p-4 border rounded-xl" required />
          </div>
          <button data-test-id="pay-button" type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">Pay Now</button>
        </form>
      )}

      {/* Processing State with Payment ID */}
      {view === 'processing' && (
        <div data-test-id="processing-state" className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <span data-test-id="processing-message" className="font-bold text-gray-700">Verifying payment...</span>
          <p className="text-xs text-gray-400 mt-2 font-mono">Reference: {activePaymentId}</p>
        </div>
      )}

      {/* Success Acknowledgment */}
      {view === 'success' && (
        <div data-test-id="success-state" className="text-center py-10 bg-green-50 rounded-xl border border-green-100">
          <div className="text-green-500 text-4xl mb-2">✓</div>
          <h2 className="text-green-800 font-bold text-xl mb-1">Payment Successful!</h2>
          <p data-test-id="success-message" className="text-green-600 text-sm mb-4">Your payment has been processed successfully</p>
          <div className="bg-white p-2 rounded border border-green-200 inline-block">
            <span data-test-id="payment-id" className="font-mono text-sm font-bold text-gray-700">{paymentResult?.id}</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {view === 'error' && (
        <div data-test-id="error-state" className="text-center py-10 bg-red-50 rounded-xl">
          <span data-test-id="error-message" className="text-red-600 font-bold">{errorMessage}</span>
          <button data-test-id="retry-button" onClick={() => { setView('selection'); setActivePaymentId(''); }} className="block mx-auto mt-4 text-indigo-600 font-bold">Try Again</button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;