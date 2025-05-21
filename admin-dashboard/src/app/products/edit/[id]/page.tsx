'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/app/components/Layout';
import ProductForm from '@/app/components/ProductForm';

interface Product {
  id: string;
  name: string;
  price: number;
}

const EditProductPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/products/${id}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setProduct(data);
        } catch (e: any) {
          setError(e.message || 'Failed to fetch product.');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (data: { name: string; price: number }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
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
      setError(e.message || 'Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Layout><p>Loading product data...</p></Layout>;
  }

  if (error && !product) { // Show error prominently if product couldn't be loaded
    return <Layout><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div></Layout>;
  }
  
  if (!product) { // This case might be hit if ID is invalid and API returns 404 before error state is set by fetch logic
    return <Layout><div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert"><strong className="font-bold">Info:</strong><span className="block sm:inline"> Product not found.</span></div></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-3xl font-semibold text-gray-700 mb-6">Edit Product (ID: {product.id})</h1>
      {error && 
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      }
      <ProductForm
        initialData={{ name: product.name, price: String(product.price) }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Update Product"
      />
    </Layout>
  );
};

export default EditProductPage;
