import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BlurText from '../components/BlurText';

export default function DealerAnalytics() {
  // Sample analytics statistics data (replace with real data)
  const stats = [
    { id: 1, title: 'Total Listings', value: '150' },
    { id: 2, title: 'Total Sales', value: '45' },
    { id: 3, title: 'Leads Generated', value: '230' },
    { id: 4, title: 'Conversion Rate', value: '19%' },
  ];

  // Dummy chart data for monthly sales (replace with real data)
  const chartData = [
    { month: 'Jan', sales: 5 },
    { month: 'Feb', sales: 8 },
    { month: 'Mar', sales: 10 },
    { month: 'Apr', sales: 7 },
    { month: 'May', sales: 12 },
    { month: 'Jun', sales: 9 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <BlurText
          text="Dealer Analytics"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-3xl font-bold text-gray-900 dark:text-white"
        />
      </div>

      {/* Analytics Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-gray-600 dark:text-gray-400">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Monthly Sales</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#374151" />
            <YAxis stroke="#374151" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#3B82F6" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

