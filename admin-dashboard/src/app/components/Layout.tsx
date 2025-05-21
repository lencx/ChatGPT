'use client'; // Required for usePathname

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation'; // For active link highlighting

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navLinkClasses = (path: string) => {
    const isActive = pathname === path;
    return `block py-2 px-3 rounded-md text-base font-medium transition-colors duration-150 ease-in-out
            ${isActive 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col shadow-lg">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Link href="/dashboard" className={navLinkClasses('/dashboard')}>
            Dashboard
          </Link>
          <Link href="/users" className={navLinkClasses('/users')}>
            Users
          </Link>
          <Link href="/products" className={navLinkClasses('/products')}>
            Products
          </Link>
          <Link href="/settings" className={navLinkClasses('/settings')}>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50"> {/* Added subtle bg color */}
        {children}
      </main>
    </div>
  );
};

export default Layout;
