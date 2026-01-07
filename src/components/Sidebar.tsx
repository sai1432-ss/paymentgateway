import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt } from 'lucide-react'; // Optional: npm install lucide-react

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Transactions', path: '/dashboard/transactions', icon: <Receipt size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-900 min-h-screen text-white p-4">
      <div className="text-xl font-bold mb-8 px-2 text-indigo-400">Payment Gateway</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;