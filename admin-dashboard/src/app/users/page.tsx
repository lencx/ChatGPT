import Layout from '@/app/components/Layout';
import React from 'react';

const UsersPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-semibold text-gray-700 mb-6">User Management</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <p className="text-gray-600">This is where user management content will go. (e.g., a table of users).</p>
        {/* Placeholder for user list or user management tools */}
      </div>
    </Layout>
  );
};

export default UsersPage;
