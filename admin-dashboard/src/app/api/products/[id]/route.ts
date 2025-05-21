import { NextRequest, NextResponse } from 'next/server';
import { Product, products } from '../db'; // Import from db.ts at the parent level

interface Params {
  id: string;
}

// GET /api/products/[id] - Get a single product
export async function GET(request: NextRequest, context: { params: Params }) {
  const { id } = context.params;
  const product = products.find(p => p.id === id);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}

// PUT /api/products/[id] - Update a product
export async function PUT(request: NextRequest, context: { params: Params }) {
  const { id } = context.params;
  try {
    const body = await request.json();
    const { name, price } = body;

    if (!name || typeof price !== 'number') {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct: Product = { ...products[productIndex], name, price };
    products[productIndex] = updatedProduct;
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request: NextRequest, context: { params: Params }) {
  const { id } = context.params;
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  products.splice(productIndex, 1);
  return NextResponse.json({ message: 'Product deleted successfully' });
}
