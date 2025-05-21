import Layout from '@/app/components/Layout';
import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-semibold text-gray-700 mb-6">Settings</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <p className="text-gray-600">This is where application settings will be managed.</p>
        {/* Placeholder for settings options */}
      </div>
    </Layout>
  );
};

export default SettingsPage;
