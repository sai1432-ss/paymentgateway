import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  // Detect the current port from the browser URL
  const currentPort = window.location.port;

  // --- 🔒 1. Port 3001: STRICT Checkout-Only Entry Point ---
  if (currentPort === '3001') {
    return (
      <Router>
        <Routes>
          {/* On port 3001, every path serves the Checkout Page */}
          <Route path="/" element={<CheckoutPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          
          {/* Catch-all: Redirect any other URL on this port to the checkout root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  // --- 🔒 2. Port 3000: STRICT Merchant Dashboard Entry Point ---
  return (
    <Router>
      <Routes>
        {/* Public Authentication */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* ❌ REMOVED: Checkout route is no longer accessible on port 3000 
            This forces use of port 3001 for payments */}

        {/* Protected Dashboard Layout with Sidebar */}
        <Route path="/dashboard/*" element={
          <div className="flex">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                {/* Dashboard Home */}
                <Route index element={<DashboardPage />} />
                {/* Transaction History */}
                <Route path="transactions" element={<TransactionsPage />} />
                
                {/* Internal Redirect: If path in dashboard is wrong, go home */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        } />

        {/* Default Redirects: Send unknown traffic on port 3000 to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;