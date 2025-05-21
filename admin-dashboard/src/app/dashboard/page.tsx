import Layout from '@/app/components/Layout';
import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-semibold text-gray-700 mb-6">Dashboard</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <p className="text-gray-600">Welcome to the admin dashboard. Use the sidebar to navigate through different sections.</p>
        {/* You can add more dashboard-specific content here later */}
      </div>
    </Layout>
  );
};

export default DashboardPage;
