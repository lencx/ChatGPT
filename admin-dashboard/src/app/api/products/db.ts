export interface Product {
  id: string;
  name: string;
  price: number;
}

// In-memory store for products
export let products: Product[] = [
  { id: '1', name: 'Product A', price: 100 },
  { id: '2', name: 'Product B', price: 200 },
];
