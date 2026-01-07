import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ 
    totalCount: 0, 
    successAmount: 0, 
    failedAmount: 0, 
    totalVolume: 0,
    rate: 0 
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/transactions', {
          headers: {
            'X-Api-Key': 'key_test_abc123',
            'X-Api-Secret': 'secret_test_xyz789'
          }
        });

        const txns = response.data.transactions;
        
        // 1. Filter transactions by status
        const successTxns = txns.filter((t: any) => t.status === 'success');
        const failedTxns = txns.filter((t: any) => t.status === 'failed' || t.status === 'fail');

        // 2. Calculate Sums (assuming backend sends paise)
        const successSum = successTxns.reduce((acc: number, t: any) => acc + t.amount, 0) / 100;
        const failedSum = failedTxns.reduce((acc: number, t: any) => acc + t.amount, 0) / 100;
        const totalVolume = txns.reduce((acc: number, t: any) => acc + t.amount, 0) / 100;

        // 3. Calculate Success Rate
        const rate = txns.length > 0 ? (successTxns.length / txns.length) * 100 : 0;

        setStats({
          totalCount: txns.length,
          successAmount: successSum,
          failedAmount: failedSum,
          totalVolume: totalVolume,
          rate: Math.round(rate)
        });
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div data-test-id="dashboard" className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* API Credentials */}
      <div data-test-id="api-credentials" className="bg-white p-6 rounded shadow mb-8 border">
        <div className="mb-2"><label className="font-semibold">API Key: </label><span data-test-id="api-key" className="font-mono text-blue-600">key_test_abc123</span></div>
        <div><label className="font-semibold">API Secret: </label><span data-test-id="api-secret" className="font-mono text-blue-600">secret_test_xyz789</span></div>
      </div>

      {/* Stats Grid */}
      <div data-test-id="stats-container" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Transactions Card */}
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-bold">TOTAL TRANSACTIONS</p>
          <div data-test-id="total-transactions" className="text-3xl font-bold">{stats.totalCount}</div>
        </div>

        {/* Success Rate Card */}
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-bold">SUCCESS RATE</p>
          <div data-test-id="success-rate" className="text-3xl font-bold">{stats.rate}%</div>
        </div>

        {/* Total Volume (All attempts) */}
        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-bold">TOTAL VOLUME (ALL)</p>
          <div className="text-3xl font-bold">₹{stats.totalVolume.toLocaleString()}</div>
        </div>

        {/* Successful Amount Card */}
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-600">
          <p className="text-sm text-green-600 font-bold">SUCCESSFUL AMOUNT</p>
          <div data-test-id="total-amount" className="text-3xl font-bold text-green-700">₹{stats.successAmount.toLocaleString()}</div>
        </div>

        {/* Failed Amount Card */}
        <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
          <p className="text-sm text-red-600 font-bold">FAILED AMOUNT</p>
          <div className="text-3xl font-bold text-red-700">₹{stats.failedAmount.toLocaleString()}</div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;