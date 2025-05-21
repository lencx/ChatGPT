'use client';

import React, { useState, useEffect } from 'react';

interface ProductFormData {
  name: string;
  price: string; // Use string for input, convert to number on submit
}

interface ProductFormProps {
  initialData?: ProductFormData | null;
  onSubmit: (data: { name: string, price: number }) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Submit'
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
  });
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: String(initialData.price), // Ensure price is a string for the input
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear specific error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; price?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required.';
    } else if (isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a valid number.';
    } else if (Number(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    await onSubmit({
      name: formData.name,
      price: parseFloat(formData.price), // Convert price to number before submitting
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-md rounded-lg border border-gray-200">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          type="text" // Use text to allow for easier validation and formatting, convert to number on submit
          name="price"
          id="price"
          value={formData.price}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${errors.price ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
        />
        {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price}</p>}
      </div>
      <div className="pt-2"> {/* Add some padding above the button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
