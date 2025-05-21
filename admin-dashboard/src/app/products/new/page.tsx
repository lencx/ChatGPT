'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import ProductForm from '@/app/components/ProductForm';

const NewProductPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { name: string; price: number }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      router.push('/products'); // Redirect to products list on success
    } catch (e: any) {
      setError(e.message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-semibold text-gray-700 mb-6">Add New Product</h1>
      {error && 
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      }
      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Create Product"
      />
    </Layout>
  );
};

export default NewProductPage;
