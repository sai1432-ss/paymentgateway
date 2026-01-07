import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/transactions', {
          headers: {
            'X-Api-Key': 'key_test_abc123',
            'X-Api-Secret': 'secret_test_xyz789'
          }
        });
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Payment Transactions</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* The table MUST have this exact data-test-id */}
        <table data-test-id="transactions-table" className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">Payment ID</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">Order ID</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">Amount (Paise)</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">Method</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((txn: any) => (
              /* Each row MUST have these exact data attributes */
              <tr key={txn.id} data-test-id="transaction-row" data-payment-id={txn.id} className="hover:bg-gray-50 transition-colors">
                <td data-test-id="payment-id" className="px-4 py-3 text-sm font-mono text-indigo-600">{txn.id}</td>
                <td data-test-id="order-id" className="px-4 py-3 text-sm font-mono text-gray-500">{txn.order_id}</td>
                <td data-test-id="amount" className="px-4 py-3 text-sm font-medium text-gray-900">{txn.amount}</td>
                <td data-test-id="method" className="px-4 py-3 text-sm text-gray-700 capitalize">{txn.method}</td>
                <td data-test-id="status" className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    txn.status === 'success' ? 'bg-green-100 text-green-700' : 
                    txn.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {txn.status}
                  </span>
                </td>
                <td data-test-id="created-at" className="px-4 py-3 text-sm text-gray-500">
                  {new Date(txn.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;