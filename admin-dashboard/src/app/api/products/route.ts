import { NextRequest, NextResponse } from 'next/server';
import { Product, products } from './db'; // Import from db.ts

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  return NextResponse.json(products);
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price } = body;

    if (!name || typeof price !== 'number') {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const newProduct: Product = {
      id: String(products.length + 1), // Simple ID generation (consider a more robust solution for real apps)
      name,
      price,
    };
    products.push(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
